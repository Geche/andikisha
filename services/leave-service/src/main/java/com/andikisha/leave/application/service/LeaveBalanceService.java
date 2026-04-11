package com.andikisha.leave.application.service;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.leave.application.dto.response.LeaveBalanceResponse;
import com.andikisha.leave.application.mapper.LeaveMapper;
import com.andikisha.leave.domain.model.LeaveBalance;
import com.andikisha.leave.domain.model.LeavePolicy;
import com.andikisha.leave.domain.model.LeaveType;
import com.andikisha.leave.domain.repository.LeaveBalanceRepository;
import com.andikisha.leave.domain.repository.LeavePolicyRepository;
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

    public LeaveBalanceService(LeaveBalanceRepository balanceRepository,
                               LeavePolicyRepository policyRepository,
                               LeaveMapper mapper) {
        this.balanceRepository = balanceRepository;
        this.policyRepository = policyRepository;
        this.mapper = mapper;
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

        for (LeavePolicy policy : policies) {
            BigDecimal proRatedDays = BigDecimal.valueOf(policy.getDaysPerYear())
                    .multiply(BigDecimal.valueOf(remainingMonths))
                    .divide(BigDecimal.valueOf(12), 1, RoundingMode.HALF_UP);

            LeaveBalance balance = LeaveBalance.create(
                    tenantId, employeeId, policy.getLeaveType(),
                    year, proRatedDays, BigDecimal.ZERO
            );
            balanceRepository.save(balance);
        }

        log.info("Initialized leave balances for employee {} with {} policies",
                employeeId, policies.size());
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
            if (policy != null) {
                BigDecimal monthlyAccrual = BigDecimal.valueOf(policy.getDaysPerYear())
                        .divide(BigDecimal.valueOf(12), 2, RoundingMode.HALF_UP);
                balance.accrue(monthlyAccrual);
                balanceRepository.save(balance);
            }
        }

        log.info("Monthly accrual completed for tenant {} year {}", tenantId, year);
    }
}