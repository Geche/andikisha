package com.andikisha.payroll.application.service;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.payroll.application.dto.request.RunPayrollRequest;
import com.andikisha.payroll.application.dto.response.PaySlipResponse;
import com.andikisha.payroll.application.dto.response.PayrollRunResponse;
import com.andikisha.payroll.application.mapper.PayrollMapper;
import com.andikisha.payroll.application.port.PayrollEventPublisher;
import com.andikisha.payroll.domain.exception.PayrollRunNotFoundException;
import com.andikisha.payroll.domain.model.DeductionResult;
import com.andikisha.payroll.domain.model.PayFrequency;
import com.andikisha.payroll.domain.model.PaySlip;
import com.andikisha.payroll.domain.model.PayrollRun;
import com.andikisha.payroll.domain.model.PayrollStatus;
import com.andikisha.payroll.domain.repository.PaySlipRepository;
import com.andikisha.payroll.domain.repository.PayrollRunRepository;
import com.andikisha.payroll.infrastructure.grpc.EmployeeGrpcClient;
import com.andikisha.payroll.infrastructure.grpc.LeaveGrpcClient;
import com.andikisha.proto.employee.EmployeeResponse;
import com.andikisha.proto.employee.SalaryStructureResponse;
import com.andikisha.proto.leave.LeaveBalanceResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PayrollService {

    private static final Logger log = LoggerFactory.getLogger(PayrollService.class);

    private static final int STANDARD_WORKING_DAYS_PER_MONTH = 22;

    private final PayrollRunRepository payrollRunRepository;
    private final PaySlipRepository paySlipRepository;
    private final KenyanTaxCalculator taxCalculator;
    private final EmployeeGrpcClient employeeClient;
    private final LeaveGrpcClient leaveClient;
    private final PayrollMapper mapper;
    private final PayrollEventPublisher eventPublisher;
    private final TransactionTemplate transactionTemplate;
    private final Clock clock;

    public PayrollService(PayrollRunRepository payrollRunRepository,
                          PaySlipRepository paySlipRepository,
                          KenyanTaxCalculator taxCalculator,
                          EmployeeGrpcClient employeeClient,
                          LeaveGrpcClient leaveClient,
                          PayrollMapper mapper,
                          PayrollEventPublisher eventPublisher,
                          PlatformTransactionManager transactionManager,
                          Clock clock) {
        this.payrollRunRepository = payrollRunRepository;
        this.paySlipRepository = paySlipRepository;
        this.taxCalculator = taxCalculator;
        this.employeeClient = employeeClient;
        this.leaveClient = leaveClient;
        this.mapper = mapper;
        this.eventPublisher = eventPublisher;
        this.transactionTemplate = new TransactionTemplate(transactionManager);
        this.clock = clock;
    }

    @Transactional
    public PayrollRunResponse initiatePayroll(RunPayrollRequest request, String initiatedBy) {
        String tenantId = TenantContext.requireTenantId();

        if (payrollRunRepository.existsByTenantIdAndPeriodAndPayFrequencyAndStatusNot(
                tenantId, request.period(),
                request.payFrequency() != null
                        ? PayFrequency.valueOf(request.payFrequency().toUpperCase())
                        : PayFrequency.MONTHLY,
                PayrollStatus.CANCELLED)) {
            throw new BusinessRuleException(
                    "DUPLICATE_PAYROLL", "A payroll run already exists for period " + request.period());
        }

        PayFrequency frequency = request.payFrequency() != null
                ? PayFrequency.valueOf(request.payFrequency().toUpperCase())
                : PayFrequency.MONTHLY;

        PayrollRun run = PayrollRun.create(tenantId, request.period(), frequency, initiatedBy);
        run = payrollRunRepository.save(run);

        eventPublisher.publishPayrollInitiated(run);
        log.info("Payroll run initiated for tenant {} period {}", tenantId, request.period());

        return mapper.toResponse(run);
    }

    /**
     * Calculates payroll in three explicit phases to avoid holding a DB connection
     * during gRPC calls (which could starve the connection pool with large tenants):
     *
     * 1. Short write TX — validate and mark the run as CALCULATING.
     * 2. No TX — fetch all employee and salary data from employee-service via gRPC.
     * 3. Write TX — build payslips and persist; on any failure, persist a FAILED state.
     */
    @Transactional(propagation = Propagation.NOT_SUPPORTED)
    public PayrollRunResponse calculatePayroll(UUID payrollRunId) {
        String tenantId = TenantContext.requireTenantId();

        // Phase 1: mark CALCULATING (short write TX); capture period for leave lookup
        final String[] periodRef = {null};
        transactionTemplate.executeWithoutResult(tx -> {
            PayrollRun run = payrollRunRepository.findByIdAndTenantId(payrollRunId, tenantId)
                    .orElseThrow(() -> new PayrollRunNotFoundException(payrollRunId));
            run.markCalculating();
            payrollRunRepository.save(run);
            periodRef[0] = run.getPeriod();
        });

        // Phase 2: fetch from gRPC — no DB connection held
        List<EmployeeResponse> employees;
        try {
            employees = employeeClient.getActiveEmployees(tenantId);
        } catch (Exception e) {
            persistFailure(payrollRunId, tenantId, "Failed to fetch employees: " + e.getMessage());
            throw new BusinessRuleException("GRPC_ERROR", "Failed to fetch employees from employee-service");
        }

        if (employees.isEmpty()) {
            persistFailure(payrollRunId, tenantId, "No active employees found");
            throw new BusinessRuleException("NO_EMPLOYEES", "No active employees found for this tenant");
        }

        // Parse period year for leave balance lookup (period format: YYYY-MM)
        int periodYear = Integer.parseInt(periodRef[0].substring(0, 4));

        List<EmployeeSalaryData> salaryData = new ArrayList<>();
        for (EmployeeResponse employee : employees) {
            try {
                SalaryStructureResponse salary = employeeClient.getSalaryStructure(
                        tenantId, employee.getId());
                List<LeaveBalanceResponse> leaveBalances = leaveClient.getLeaveBalances(
                        tenantId, employee.getId(), periodYear);
                salaryData.add(new EmployeeSalaryData(employee, salary, leaveBalances));
            } catch (Exception e) {
                log.warn("Failed to fetch salary for employee {}, skipping: {}",
                        employee.getId(), e.getMessage());
            }
        }

        int skipped = employees.size() - salaryData.size();
        if (skipped > 0) {
            log.warn("PAYROLL ALERT [tenant={}, run={}]: {}/{} employees skipped due to salary fetch failures — " +
                    "their pay slips will NOT be included in this run. Investigate before approving.",
                    tenantId, payrollRunId, skipped, employees.size());
        }

        if (salaryData.isEmpty()) {
            persistFailure(payrollRunId, tenantId, "Could not retrieve salary data for any employee");
            throw new BusinessRuleException("NO_SALARY_DATA",
                    "Could not retrieve salary data for any employee");
        }

        log.info("Calculating payroll for {} employees", salaryData.size());

        // Phase 3: build payslips and save (write TX); persist failure state on any error
        PayrollRunResponse result;
        try {
            result = transactionTemplate.execute(tx -> {
                PayrollRun run = payrollRunRepository.findByIdAndTenantId(payrollRunId, tenantId)
                        .orElseThrow(() -> new PayrollRunNotFoundException(payrollRunId));

                for (EmployeeSalaryData data : salaryData) {
                    EmployeeResponse employee = data.employee();
                    SalaryStructureResponse salary = data.salary();

                    BigDecimal basicPay  = parseSalary(salary.getBasicSalary());
                    BigDecimal housing   = parseSalary(salary.getHousingAllowance());
                    BigDecimal transport = parseSalary(salary.getTransportAllowance());
                    BigDecimal medical   = parseSalary(salary.getMedicalAllowance());
                    BigDecimal other     = parseSalary(salary.getOtherAllowances());

                    if (basicPay.compareTo(BigDecimal.ZERO) == 0) {
                        log.warn("Employee {} has zero basic pay, skipping", employee.getId());
                        continue;
                    }

                    BigDecimal totalAllowances = housing.add(transport).add(medical).add(other);
                    BigDecimal grossPay        = basicPay.add(totalAllowances);

                    // Pass basicPay separately: NSSF is on pensionable pay, not gross
                    DeductionResult deductions = taxCalculator.calculate(grossPay, basicPay);

                    // Unpaid leave deduction: daily rate × unpaid days used this period
                    BigDecimal unpaidLeaveDeduction = computeUnpaidLeaveDeduction(
                            basicPay, data.leaveBalances());
                    BigDecimal totalDeductions = deductions.totalDeductions().add(unpaidLeaveDeduction);
                    BigDecimal netPay = deductions.netPay().subtract(unpaidLeaveDeduction)
                            .max(BigDecimal.ZERO);

                    PaySlip paySlip = PaySlip.builder()
                            .tenantId(tenantId)
                            .employeeId(UUID.fromString(employee.getId()))
                            .employeeNumber(employee.getEmployeeNumber())
                            .employeeName(employee.getFirstName() + " " + employee.getLastName())
                            .basicPay(basicPay)
                            .housingAllowance(housing)
                            .transportAllowance(transport)
                            .medicalAllowance(medical)
                            .otherAllowances(other)
                            .totalAllowances(totalAllowances)
                            .grossPay(grossPay)
                            .paye(deductions.netPaye())
                            .nssf(deductions.nssfEmployee())
                            .nssfEmployer(deductions.nssfEmployer())
                            .shif(deductions.shif())
                            .housingLevy(deductions.housingLevyEmployee())
                            .housingLevyEmployer(deductions.housingLevyEmployer())
                            .helb(BigDecimal.ZERO)
                            .otherDeductions(unpaidLeaveDeduction)
                            .personalRelief(deductions.personalRelief())
                            .insuranceRelief(deductions.insuranceRelief())
                            .totalDeductions(totalDeductions)
                            .netPay(netPay)
                            .currency(salary.getCurrency().isBlank() ? "KES" : salary.getCurrency())
                            .paymentPhone(employee.getPhoneNumber())
                            .build();

                    run.addPaySlip(paySlip);
                }

                run.finishCalculation();
                PayrollRun saved = payrollRunRepository.save(run);

                eventPublisher.publishPayrollCalculated(saved);

                return mapper.toResponse(saved);
            });
        } catch (PayrollRunNotFoundException | BusinessRuleException e) {
            throw e;
        } catch (Exception e) {
            log.error("Payroll calculation failed for run {}", payrollRunId, e);
            persistFailure(payrollRunId, tenantId, e.getMessage());
            throw new BusinessRuleException("CALCULATION_FAILED",
                    "Payroll calculation failed: " + e.getMessage());
        }

        // Log after commit — not inside the transaction lambda
        log.info("Payroll calculation complete. {} employees, total net: {}",
                result.employeeCount(), result.totalNet());

        return result;
    }

    @Transactional
    public PayrollRunResponse approvePayroll(UUID payrollRunId, String approvedBy) {
        String tenantId = TenantContext.requireTenantId();

        PayrollRun run = payrollRunRepository.findByIdAndTenantId(payrollRunId, tenantId)
                .orElseThrow(() -> new PayrollRunNotFoundException(payrollRunId));

        run.approve(approvedBy, LocalDateTime.now(clock));
        run = payrollRunRepository.save(run);

        eventPublisher.publishPayrollApproved(run);

        log.info("Payroll approved for period {} by {}", run.getPeriod(), approvedBy);
        return mapper.toResponse(run);
    }

    public PayrollRunResponse getPayrollRun(UUID payrollRunId) {
        String tenantId = TenantContext.requireTenantId();
        PayrollRun run = payrollRunRepository.findByIdAndTenantId(payrollRunId, tenantId)
                .orElseThrow(() -> new PayrollRunNotFoundException(payrollRunId));
        return mapper.toResponse(run);
    }

    public Page<PayrollRunResponse> listPayrollRuns(Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();
        return payrollRunRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable)
                .map(mapper::toResponse);
    }

    public List<PaySlipResponse> getPaySlipsForRun(UUID payrollRunId) {
        String tenantId = TenantContext.requireTenantId();
        return paySlipRepository.findByPayrollRunIdAndTenantId(payrollRunId, tenantId)
                .stream().map(mapper::toResponse).toList();
    }

    public PaySlipResponse getPaySlip(UUID paySlipId) {
        String tenantId = TenantContext.requireTenantId();
        PaySlip slip = paySlipRepository.findByIdAndTenantId(paySlipId, tenantId)
                .orElseThrow(() -> new com.andikisha.common.exception.ResourceNotFoundException(
                        "PaySlip", paySlipId));
        return mapper.toResponse(slip);
    }

    public Page<PaySlipResponse> getEmployeePaySlips(UUID employeeId, Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();
        return paySlipRepository.findByEmployeeIdAndTenantIdOrderByCreatedAtDesc(
                        employeeId, tenantId, pageable)
                .map(mapper::toResponse);
    }

    @Transactional
    public void cancelPayroll(UUID payrollRunId, String reason) {
        String tenantId = TenantContext.requireTenantId();
        PayrollRun run = payrollRunRepository.findByIdAndTenantId(payrollRunId, tenantId)
                .orElseThrow(() -> new PayrollRunNotFoundException(payrollRunId));
        run.cancel(reason);
        payrollRunRepository.save(run);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /**
     * Saves a FAILED status for the payroll run in its own transaction so the
     * failure record is persisted even if the calling context is rolling back.
     */
    private void persistFailure(UUID payrollRunId, String tenantId, String reason) {
        try {
            transactionTemplate.executeWithoutResult(tx ->
                payrollRunRepository.findByIdAndTenantId(payrollRunId, tenantId)
                        .ifPresent(run -> {
                            run.fail(reason);
                            payrollRunRepository.save(run);
                        })
            );
        } catch (Exception ex) {
            log.error("Failed to persist failure state for run {}: {}", payrollRunId, ex.getMessage());
        }
    }

    /**
     * Parses a salary string from gRPC proto (string fields avoid double precision loss).
     * Returns ZERO for null, blank, or malformed values.
     */
    private static BigDecimal parseSalary(String value) {
        if (value == null || value.isBlank()) return BigDecimal.ZERO;
        try {
            return new BigDecimal(value);
        } catch (NumberFormatException e) {
            log.warn("Malformed salary value '{}', treating as zero", value);
            return BigDecimal.ZERO;
        }
    }

    /**
     * Deducts unpaid leave at a daily rate of basicPay / 22 working days.
     * Only UNPAID leave type is deducted; all other leave types (annual, sick, etc.)
     * are paid entitlements and do not affect the payslip.
     */
    private BigDecimal computeUnpaidLeaveDeduction(BigDecimal basicPay,
                                                    List<LeaveBalanceResponse> balances) {
        double unpaidDaysUsed = balances.stream()
                .filter(b -> "UNPAID".equals(b.getLeaveType()))
                .mapToDouble(LeaveBalanceResponse::getUsed)
                .findFirst()
                .orElse(0.0);

        if (unpaidDaysUsed <= 0.0) return BigDecimal.ZERO;

        BigDecimal dailyRate = basicPay.divide(
                BigDecimal.valueOf(STANDARD_WORKING_DAYS_PER_MONTH), 2, java.math.RoundingMode.HALF_UP);
        return dailyRate.multiply(BigDecimal.valueOf(unpaidDaysUsed))
                .setScale(2, java.math.RoundingMode.HALF_UP);
    }

    private record EmployeeSalaryData(EmployeeResponse employee, SalaryStructureResponse salary,
                                      List<LeaveBalanceResponse> leaveBalances) {}
}
