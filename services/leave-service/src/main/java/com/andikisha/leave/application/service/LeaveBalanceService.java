package com.andikisha.leave.application.service;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.leave.application.dto.response.LeaveBalanceResponse;
import com.andikisha.leave.application.mapper.LeaveMapper;
import com.andikisha.leave.domain.model.LeaveBalance;
import com.andikisha.leave.domain.model.LeavePolicy;
import com.andikisha.leave.domain.model.LeaveType;
import com.andikisha.leave.domain.repository.LeaveBalanceRepository;
import com.andikisha.leave.domain.repository.LeavePolicyRepository;
import com.andikisha.leave.infrastructure.grpc.EmployeeGrpcClient;
import com.andikisha.proto.employee.EmployeeResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class LeaveBalanceService {

    private static final Logger log = LoggerFactory.getLogger(LeaveBalanceService.class);

    private final LeaveBalanceRepository balanceRepository;
    private final LeavePolicyRepository policyRepository;
    private final LeaveMapper mapper;
    private final EmployeeGrpcClient employeeGrpcClient;

    public LeaveBalanceService(LeaveBalanceRepository balanceRepository,
                               LeavePolicyRepository policyRepository,
                               LeaveMapper mapper,
                               EmployeeGrpcClient employeeGrpcClient) {
        this.balanceRepository = balanceRepository;
        this.policyRepository = policyRepository;
        this.mapper = mapper;
        this.employeeGrpcClient = employeeGrpcClient;
    }

    public List<LeaveBalanceResponse> getBalances(UUID employeeId, int year) {
        String tenantId = TenantContext.requireTenantId();
        return balanceRepository.findByTenantIdAndEmployeeIdAndYear(
                        tenantId, employeeId, year)
                .stream().map(mapper::toResponse).toList();
    }

    @Transactional
    public void initializeForNewEmployee(String tenantId, UUID employeeId) {
        LocalDate today = LocalDate.now();
        int year = today.getYear();
        int remainingMonths = 13 - today.getMonthValue(); // inclusive of current month
        List<LeavePolicy> policies = policyRepository.findByTenantIdAndActiveTrue(tenantId);

        // Gender drives eligibility for parental leave (maternity/paternity).
        String gender = employeeGrpcClient.getEmployee(tenantId, employeeId.toString())
                .map(EmployeeResponse::getGender)
                .filter(g -> !g.isBlank())
                .orElse(null);

        int created = 0;
        for (LeavePolicy policy : policies) {
            LeaveType type = policy.getLeaveType();

            // Skip statutory parental leave the employee isn't eligible for. When the
            // gender is unknown, gender-restricted types are skipped rather than guessed.
            String requiredGender = type.restrictedToGender();
            if (requiredGender != null && !requiredGender.equalsIgnoreCase(gender)) {
                continue;
            }

            // Annual leave pro-rates by join date and accrues monthly; statutory and
            // event-based leave is granted as a whole-day entitlement (no fractions).
            BigDecimal openingDays = type.accruesMonthly()
                    ? BigDecimal.valueOf(policy.getDaysPerYear())
                            .multiply(BigDecimal.valueOf(remainingMonths))
                            .divide(BigDecimal.valueOf(12), 1, RoundingMode.HALF_UP)
                    : BigDecimal.valueOf(policy.getDaysPerYear());

            LeaveBalance balance = LeaveBalance.create(
                    tenantId, employeeId, type, year, openingDays, BigDecimal.ZERO);
            balanceRepository.save(balance);
            created++;
        }

        log.info("Initialized {} leave balances for employee {} (gender={})",
                created, employeeId, gender);
    }

    @Transactional
    public void freezeForTerminatedEmployee(String tenantId, UUID employeeId) {
        balanceRepository.freezeAllByEmployee(tenantId, employeeId);
        log.info("Frozen leave balances for terminated employee {}", employeeId);
    }

    @Transactional
    public void runMonthlyAccrual(String tenantId) {
        int year = LocalDate.now().getYear();
        List<LeavePolicy> policies = policyRepository.findByTenantIdAndActiveTrue(tenantId);
        List<LeaveBalance> balances = balanceRepository.findActiveBalancesForYear(tenantId, year);

        Map<LeaveType, LeavePolicy> policyByType = policies.stream()
                .collect(Collectors.toMap(LeavePolicy::getLeaveType, p -> p));

        for (LeaveBalance balance : balances) {
            LeavePolicy policy = policyByType.get(balance.getLeaveType());
            // Only accruing types (annual) gain days monthly; statutory/event-based
            // entitlements stay at their full granted value.
            if (policy != null && balance.getLeaveType().accruesMonthly()) {
                BigDecimal monthlyAccrual = BigDecimal.valueOf(policy.getDaysPerYear())
                        .divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
                balance.accrue(monthlyAccrual);
                balanceRepository.save(balance);
            }
        }

        log.info("Monthly accrual completed for tenant {} year {}", tenantId, year);
    }
}