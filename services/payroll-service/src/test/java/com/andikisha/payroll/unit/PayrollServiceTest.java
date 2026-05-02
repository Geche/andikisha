package com.andikisha.payroll.unit;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.payroll.application.dto.request.RunPayrollRequest;
import com.andikisha.payroll.application.dto.response.PayrollRunResponse;
import com.andikisha.payroll.application.mapper.PayrollMapper;
import com.andikisha.payroll.application.port.PayrollEventPublisher;
import com.andikisha.payroll.application.service.KenyanTaxCalculator;
import com.andikisha.payroll.application.service.PayrollService;
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
import com.andikisha.proto.leave.EmployeeLeaveBalances;
import com.andikisha.proto.leave.LeaveBalanceResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionStatus;

import java.math.BigDecimal;
import java.time.Clock;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PayrollServiceTest {

    private static final String TENANT_ID = "unit-test-tenant";
    private static final String PERIOD    = "2024-01";

    @Mock PayrollRunRepository payrollRunRepository;
    @Mock PaySlipRepository paySlipRepository;
    @Mock KenyanTaxCalculator taxCalculator;
    @Mock EmployeeGrpcClient employeeClient;
    @Mock LeaveGrpcClient leaveClient;
    @Mock PayrollMapper mapper;
    @Mock PayrollEventPublisher eventPublisher;
    @Mock PlatformTransactionManager transactionManager;
    @Mock Clock clock;

    private PayrollService service;

    @BeforeEach
    void setUp() {
        // lenient() because not every test exercises transactionManager or clock
        TransactionStatus txStatus = mock(TransactionStatus.class);
        lenient().when(transactionManager.getTransaction(any())).thenReturn(txStatus);
        lenient().when(clock.instant()).thenReturn(Instant.parse("2024-01-31T12:00:00Z"));
        lenient().when(clock.getZone()).thenReturn(ZoneOffset.UTC);

        service = new PayrollService(payrollRunRepository, paySlipRepository, taxCalculator,
                employeeClient, leaveClient, mapper, eventPublisher, transactionManager, clock);

        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    // -------------------------------------------------------------------------
    // initiatePayroll
    // -------------------------------------------------------------------------

    @Test
    void initiatePayroll_happyPath_savesAndPublishesEvent() {
        when(payrollRunRepository.existsByTenantIdAndPeriodAndPayFrequencyAndStatusIn(
                any(), any(), any(), any()))
                .thenReturn(false);
        when(payrollRunRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        PayrollRunResponse expected = minimalRunResponse();
        when(mapper.toResponse(any(PayrollRun.class))).thenReturn(expected);

        PayrollRunResponse result = service.initiatePayroll(
                new RunPayrollRequest(PERIOD, "MONTHLY"), "hr-admin");

        assertThat(result).isEqualTo(expected);
        verify(payrollRunRepository).save(any(PayrollRun.class));
        verify(eventPublisher).publishPayrollInitiated(any(PayrollRun.class));
    }

    @Test
    void initiatePayroll_withNullFrequency_defaultsToMonthly() {
        when(payrollRunRepository.existsByTenantIdAndPeriodAndPayFrequencyAndStatusIn(
                any(), any(), any(), any()))
                .thenReturn(false);
        when(payrollRunRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(mapper.toResponse(any(PayrollRun.class))).thenReturn(minimalRunResponse());

        // payFrequency = null → should default to MONTHLY
        service.initiatePayroll(new RunPayrollRequest(PERIOD, null), "hr-admin");

        verify(payrollRunRepository).existsByTenantIdAndPeriodAndPayFrequencyAndStatusIn(
                eq(TENANT_ID), eq(PERIOD), eq(PayFrequency.MONTHLY), any());
    }

    @Test
    void initiatePayroll_whenDuplicatePeriodExists_throwsBusinessRuleException() {
        when(payrollRunRepository.existsByTenantIdAndPeriodAndPayFrequencyAndStatusIn(
                any(), any(), any(), any()))
                .thenReturn(true);

        assertThatThrownBy(() -> service.initiatePayroll(
                new RunPayrollRequest(PERIOD, "MONTHLY"), "hr-admin"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining(PERIOD);

        verify(payrollRunRepository, never()).save(any());
        verifyNoInteractions(eventPublisher);
    }

    @Test
    void initiatePayroll_sameMonthNewFiscalYear_succeeds() {
        // Only ACTIVE statuses block — COMPLETED from last year does not.
        // The repository, queried with the active-status whitelist, returns false
        // because no active run exists for the new period.
        when(payrollRunRepository.existsByTenantIdAndPeriodAndPayFrequencyAndStatusIn(
                any(), any(), any(), any()))
                .thenReturn(false);
        when(payrollRunRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(mapper.toResponse(any(PayrollRun.class))).thenReturn(minimalRunResponse());

        // Should not throw — same calendar month, new fiscal year
        assertThatNoException().isThrownBy(() ->
                service.initiatePayroll(
                        new RunPayrollRequest("2026-01", "MONTHLY"),
                        "hr-admin"));

        verify(payrollRunRepository).save(any(PayrollRun.class));
        verify(eventPublisher).publishPayrollInitiated(any(PayrollRun.class));
    }

    // -------------------------------------------------------------------------
    // approvePayroll
    // -------------------------------------------------------------------------

    @Test
    void approvePayroll_happyPath_approvesAndPublishesEvent() {
        PayrollRun run = buildCalculatedRun();
        UUID runId = UUID.randomUUID();
        when(payrollRunRepository.findByIdAndTenantId(runId, TENANT_ID))
                .thenReturn(Optional.of(run));
        when(payrollRunRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(mapper.toResponse(any(PayrollRun.class))).thenReturn(minimalRunResponse());

        service.approvePayroll(runId, "cfo-user");

        assertThat(run.getStatus()).isEqualTo(PayrollStatus.APPROVED);
        assertThat(run.getApprovedBy()).isEqualTo("cfo-user");
        verify(eventPublisher).publishPayrollApproved(run);
    }

    @Test
    void approvePayroll_whenRunNotFound_throwsPayrollRunNotFoundException() {
        UUID runId = UUID.randomUUID();
        when(payrollRunRepository.findByIdAndTenantId(runId, TENANT_ID))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.approvePayroll(runId, "cfo-user"))
                .isInstanceOf(PayrollRunNotFoundException.class);

        verifyNoInteractions(eventPublisher);
    }

    @Test
    void approvePayroll_whenRunNotInCalculatedState_throwsBusinessRuleException() {
        PayrollRun draftRun = PayrollRun.create(TENANT_ID, PERIOD, PayFrequency.MONTHLY, "hr");
        UUID runId = UUID.randomUUID();
        when(payrollRunRepository.findByIdAndTenantId(runId, TENANT_ID))
                .thenReturn(Optional.of(draftRun));

        assertThatThrownBy(() -> service.approvePayroll(runId, "cfo-user"))
                .isInstanceOf(BusinessRuleException.class);

        verifyNoInteractions(eventPublisher);
    }

    // -------------------------------------------------------------------------
    // cancelPayroll
    // -------------------------------------------------------------------------

    @Test
    void cancelPayroll_fromDraft_cancelsProperly() {
        PayrollRun run = PayrollRun.create(TENANT_ID, PERIOD, PayFrequency.MONTHLY, "hr");
        UUID runId = UUID.randomUUID();
        when(payrollRunRepository.findByIdAndTenantId(runId, TENANT_ID))
                .thenReturn(Optional.of(run));
        when(payrollRunRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        service.cancelPayroll(runId, "Duplicate run");

        assertThat(run.getStatus()).isEqualTo(PayrollStatus.CANCELLED);
        verify(payrollRunRepository).save(run);
    }

    @Test
    void cancelPayroll_whenNotFound_throwsPayrollRunNotFoundException() {
        UUID runId = UUID.randomUUID();
        when(payrollRunRepository.findByIdAndTenantId(runId, TENANT_ID))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.cancelPayroll(runId, "reason"))
                .isInstanceOf(PayrollRunNotFoundException.class);
    }

    // -------------------------------------------------------------------------
    // getPayrollRun
    // -------------------------------------------------------------------------

    @Test
    void getPayrollRun_whenFound_returnsResponse() {
        PayrollRun run = PayrollRun.create(TENANT_ID, PERIOD, PayFrequency.MONTHLY, "hr");
        UUID runId = UUID.randomUUID();
        when(payrollRunRepository.findByIdAndTenantId(runId, TENANT_ID))
                .thenReturn(Optional.of(run));
        PayrollRunResponse expected = minimalRunResponse();
        when(mapper.toResponse(run)).thenReturn(expected);

        assertThat(service.getPayrollRun(runId)).isEqualTo(expected);
    }

    @Test
    void getPayrollRun_whenNotFound_throwsPayrollRunNotFoundException() {
        UUID runId = UUID.randomUUID();
        when(payrollRunRepository.findByIdAndTenantId(runId, TENANT_ID))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getPayrollRun(runId))
                .isInstanceOf(PayrollRunNotFoundException.class);
    }

    // -------------------------------------------------------------------------
    // calculatePayroll — batch gRPC call pattern
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("calculatePayroll makes exactly 1 salary batch call and 1 leave batch call regardless of employee count")
    void calculatePayroll_usesBatchGrpcCalls() {
        UUID runId = UUID.randomUUID();

        // Build 5 employees with distinct IDs
        List<EmployeeResponse> employees = IntStream.rangeClosed(1, 5)
                .mapToObj(i -> EmployeeResponse.newBuilder()
                        .setId(UUID.randomUUID().toString())
                        .setTenantId(TENANT_ID)
                        .setEmployeeNumber("EMP-000" + i)
                        .setFirstName("First" + i)
                        .setLastName("Last" + i)
                        .setPhoneNumber("+2547000000" + i)
                        .setNationalId("NID" + i)
                        .setKraPin("KRA" + i)
                        .setNhifNumber("NHIF" + i)
                        .setNssfNumber("NSSF" + i)
                        .setBasicSalary("100000")
                        .setCurrency("KES")
                        .build())
                .toList();

        // Salary batch: one SalaryStructureResponse per employee
        List<SalaryStructureResponse> salaryBatch = employees.stream()
                .map(e -> SalaryStructureResponse.newBuilder()
                        .setEmployeeId(e.getId())
                        .setBasicSalary("100000")
                        .setHousingAllowance("0")
                        .setTransportAllowance("0")
                        .setMedicalAllowance("0")
                        .setOtherAllowances("0")
                        .setCurrency("KES")
                        .build())
                .toList();

        // Leave batch: one EmployeeLeaveBalances per employee (empty balances)
        List<EmployeeLeaveBalances> leaveBatch = employees.stream()
                .map(e -> EmployeeLeaveBalances.newBuilder()
                        .setEmployeeId(e.getId())
                        .build())
                .toList();

        // PayrollRun mock — provide a DRAFT run; the service calls markCalculating() internally
        PayrollRun run = PayrollRun.create(TENANT_ID, PERIOD, PayFrequency.MONTHLY, "hr");
        when(payrollRunRepository.findByIdAndTenantId(runId, TENANT_ID))
                .thenReturn(Optional.of(run));
        when(payrollRunRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        // gRPC client stubs
        when(employeeClient.getActiveEmployees(TENANT_ID)).thenReturn(employees);
        when(employeeClient.getSalaryStructuresBatch(anyString(), anyList())).thenReturn(salaryBatch);
        when(leaveClient.getLeaveBalancesBatch(anyString(), anyList(), anyInt())).thenReturn(leaveBatch);

        // Tax calculator stub — return a minimal DeductionResult
        DeductionResult deductions = new DeductionResult(
                BigDecimal.valueOf(100_000), BigDecimal.valueOf(100_000),
                BigDecimal.valueOf(27_600), BigDecimal.valueOf(2_400),
                BigDecimal.valueOf(412), BigDecimal.valueOf(25_200),
                BigDecimal.valueOf(2_160), BigDecimal.valueOf(2_160),
                BigDecimal.valueOf(2_750), BigDecimal.valueOf(1_500),
                BigDecimal.valueOf(1_500), BigDecimal.valueOf(31_610),
                BigDecimal.valueOf(68_390));
        when(taxCalculator.calculate(any(), any())).thenReturn(deductions);

        when(mapper.toResponse(any(PayrollRun.class))).thenReturn(minimalRunResponse());

        // Execute
        service.calculatePayroll(runId);

        // Verify: exactly 1 batch call for salaries and 1 for leave — never the per-employee methods
        verify(employeeClient, times(1)).getSalaryStructuresBatch(eq(TENANT_ID), anyList());
        verify(leaveClient, times(1)).getLeaveBalancesBatch(eq(TENANT_ID), anyList(), eq(2024));
        verify(employeeClient, never()).getSalaryStructure(anyString(), anyString());
        verify(leaveClient, never()).getLeaveBalances(anyString(), anyString(), anyInt());
    }

    // -------------------------------------------------------------------------
    // computeUnpaidLeaveDeduction (private — tested via ReflectionTestUtils)
    // -------------------------------------------------------------------------

    @Test
    void computeUnpaidLeaveDeduction_noUnpaidLeave_returnsZero() {
        List<LeaveBalanceResponse> balances = List.of(
                LeaveBalanceResponse.newBuilder().setLeaveType("ANNUAL").setUsed("5.0").build(),
                LeaveBalanceResponse.newBuilder().setLeaveType("SICK").setUsed("2.0").build()
        );

        BigDecimal result = invokeDeduction(BigDecimal.valueOf(100_000), balances);
        assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void computeUnpaidLeaveDeduction_unpaidDaysUsed_deductsCorrectly() {
        // basicPay=100_000, unpaid=11 days, daily rate=100_000/22=4_545.4545, deduction=50_000.00
        List<LeaveBalanceResponse> balances = List.of(
                LeaveBalanceResponse.newBuilder().setLeaveType("UNPAID").setUsed("11.0").build()
        );

        BigDecimal result = invokeDeduction(BigDecimal.valueOf(100_000), balances);
        assertThat(result).isEqualByComparingTo(new BigDecimal("50000.00"));
    }

    @Test
    void computeUnpaidLeaveDeduction_multipleUnpaidEntries_sumsAllUsed() {
        // Two UNPAID entries: 5 + 3 = 8 days; daily rate = 50_000/22
        List<LeaveBalanceResponse> balances = List.of(
                LeaveBalanceResponse.newBuilder().setLeaveType("UNPAID").setUsed("5.0").build(),
                LeaveBalanceResponse.newBuilder().setLeaveType("UNPAID").setUsed("3.0").build()
        );

        BigDecimal result = invokeDeduction(BigDecimal.valueOf(50_000), balances);
        BigDecimal expected = BigDecimal.valueOf(50_000)
                .divide(BigDecimal.valueOf(22), 4, java.math.RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(8))
                .setScale(2, java.math.RoundingMode.HALF_UP);
        assertThat(result).isEqualByComparingTo(expected);
    }

    @Test
    void computeUnpaidLeaveDeduction_zeroUnpaidUsed_returnsZero() {
        List<LeaveBalanceResponse> balances = List.of(
                LeaveBalanceResponse.newBuilder().setLeaveType("UNPAID").setUsed("0.0").build()
        );

        BigDecimal result = invokeDeduction(BigDecimal.valueOf(80_000), balances);
        assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @Test
    void computeUnpaidLeaveDeduction_emptyBalances_returnsZero() {
        BigDecimal result = invokeDeduction(BigDecimal.valueOf(60_000), List.of());
        assertThat(result).isEqualByComparingTo(BigDecimal.ZERO);
    }

    @SuppressWarnings("unchecked")
    private BigDecimal invokeDeduction(BigDecimal basicPay, List<LeaveBalanceResponse> balances) {
        return (BigDecimal) ReflectionTestUtils.invokeMethod(
                service, "computeUnpaidLeaveDeduction", basicPay, balances);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    /** Returns a PayrollRun in CALCULATED state with one pay slip. */
    private PayrollRun buildCalculatedRun() {
        PayrollRun run = PayrollRun.create(TENANT_ID, PERIOD, PayFrequency.MONTHLY, "hr");
        run.markCalculating();
        run.addPaySlip(PaySlip.builder()
                .tenantId(TENANT_ID)
                .employeeId(UUID.randomUUID())
                .employeeNumber("EMP-0001")
                .employeeName("Test Employee")
                .basicPay(BigDecimal.valueOf(100_000))
                .housingAllowance(BigDecimal.ZERO)
                .transportAllowance(BigDecimal.ZERO)
                .medicalAllowance(BigDecimal.ZERO)
                .otherAllowances(BigDecimal.ZERO)
                .totalAllowances(BigDecimal.ZERO)
                .grossPay(BigDecimal.valueOf(100_000))
                .paye(BigDecimal.valueOf(25_000))
                .nssf(BigDecimal.valueOf(2_160))
                .nssfEmployer(BigDecimal.valueOf(2_160))
                .shif(BigDecimal.valueOf(2_750))
                .housingLevy(BigDecimal.valueOf(1_500))
                .housingLevyEmployer(BigDecimal.valueOf(1_500))
                .helb(BigDecimal.ZERO)
                .otherDeductions(BigDecimal.ZERO)
                .personalRelief(BigDecimal.valueOf(2_400))
                .insuranceRelief(BigDecimal.valueOf(412))
                .totalDeductions(BigDecimal.valueOf(31_410))
                .netPay(BigDecimal.valueOf(68_590))
                .currency("KES")
                .paymentPhone("+254700000001")
                .build());
        run.finishCalculation();
        return run;
    }

    private PayrollRunResponse minimalRunResponse() {
        return new PayrollRunResponse(
                UUID.randomUUID(), PERIOD, "MONTHLY", "DRAFT",
                0, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, "KES", "hr-admin", null, null, null,
                LocalDateTime.now());
    }
}
