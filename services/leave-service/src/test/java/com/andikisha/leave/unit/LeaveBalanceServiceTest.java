package com.andikisha.leave.unit;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.leave.application.mapper.LeaveMapper;
import com.andikisha.leave.application.service.LeaveBalanceService;
import com.andikisha.leave.domain.model.LeaveBalance;
import com.andikisha.leave.domain.model.LeavePolicy;
import com.andikisha.leave.domain.model.LeaveType;
import com.andikisha.leave.domain.repository.LeaveBalanceRepository;
import com.andikisha.leave.domain.repository.LeavePolicyRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LeaveBalanceServiceTest {

    @Mock private LeaveBalanceRepository balanceRepository;
    @Mock private LeavePolicyRepository policyRepository;
    @Mock private LeaveMapper mapper;

    @InjectMocks private LeaveBalanceService leaveBalanceService;

    private static final String TENANT_ID   = "tenant-1";
    private static final UUID   EMPLOYEE_ID = UUID.randomUUID();

    @BeforeEach
    void setUp() { TenantContext.setTenantId(TENANT_ID); }

    @AfterEach
    void tearDown() { TenantContext.clear(); }

    // ------------------------------------------------------------------
    // initializeForNewEmployee
    // ------------------------------------------------------------------

    @Test
    void initializeForNewEmployee_createsOneBalancePerActivePolicy() {
        LeavePolicy annual = LeavePolicy.create(TENANT_ID, LeaveType.ANNUAL, 21, 5, true, false);
        LeavePolicy sick   = LeavePolicy.create(TENANT_ID, LeaveType.SICK,   30, 0, false, true);

        when(policyRepository.findByTenantIdAndActiveTrue(TENANT_ID))
                .thenReturn(List.of(annual, sick));

        leaveBalanceService.initializeForNewEmployee(TENANT_ID, EMPLOYEE_ID);

        verify(balanceRepository, times(2)).save(any(LeaveBalance.class));
    }

    @Test
    void initializeForNewEmployee_proRatesDaysFromCurrentMonth() {
        // Policy: 24 days/year → 2 days/month (clean arithmetic for pro-rating test).
        // Verifies the saved balance has accrued > 0 and <= daysPerYear.
        // 24 days meets the Kenyan Employment Act 21-day minimum for ANNUAL leave.
        LeavePolicy annual = LeavePolicy.create(TENANT_ID, LeaveType.ANNUAL, 24, 0, true, false);

        when(policyRepository.findByTenantIdAndActiveTrue(TENANT_ID))
                .thenReturn(List.of(annual));

        leaveBalanceService.initializeForNewEmployee(TENANT_ID, EMPLOYEE_ID);

        ArgumentCaptor<LeaveBalance> captor = ArgumentCaptor.forClass(LeaveBalance.class);
        verify(balanceRepository).save(captor.capture());

        BigDecimal accrued = captor.getValue().getAccrued();
        assertThat(accrued).isGreaterThan(BigDecimal.ZERO);
        assertThat(accrued).isLessThanOrEqualTo(BigDecimal.valueOf(24));
    }

    @Test
    void initializeForNewEmployee_noPolicies_savesNothing() {
        when(policyRepository.findByTenantIdAndActiveTrue(TENANT_ID))
                .thenReturn(List.of());

        leaveBalanceService.initializeForNewEmployee(TENANT_ID, EMPLOYEE_ID);

        verify(balanceRepository, times(0)).save(any());
    }

    // ------------------------------------------------------------------
    // freezeForTerminatedEmployee
    // ------------------------------------------------------------------

    @Test
    void freezeForTerminatedEmployee_callsBulkFreeze() {
        leaveBalanceService.freezeForTerminatedEmployee(TENANT_ID, EMPLOYEE_ID);

        verify(balanceRepository).freezeAllByEmployee(TENANT_ID, EMPLOYEE_ID);
    }

    // ------------------------------------------------------------------
    // runMonthlyAccrual
    // ------------------------------------------------------------------

    @Test
    void runMonthlyAccrual_accruesToEachActiveBalance() {
        int year = LocalDate.now().getYear();

        LeavePolicy annual = LeavePolicy.create(TENANT_ID, LeaveType.ANNUAL, 24, 0, true, false);
        LeaveBalance balance = LeaveBalance.create(
                TENANT_ID, EMPLOYEE_ID, LeaveType.ANNUAL, year,
                BigDecimal.ZERO, BigDecimal.ZERO);

        when(policyRepository.findByTenantIdAndActiveTrue(TENANT_ID))
                .thenReturn(List.of(annual));
        when(balanceRepository.findActiveBalancesForYear(TENANT_ID, year))
                .thenReturn(List.of(balance));

        leaveBalanceService.runMonthlyAccrual(TENANT_ID);

        // 24 days / 12 months = 2.00 per month
        assertThat(balance.getAccrued()).isEqualByComparingTo("2.00");
        verify(balanceRepository).save(balance);
    }

    @Test
    void runMonthlyAccrual_balanceWithNoMatchingPolicy_isSkipped() {
        int year = LocalDate.now().getYear();

        // Balance is for COMPASSIONATE but no policy exists for it
        LeaveBalance balance = LeaveBalance.create(
                TENANT_ID, EMPLOYEE_ID, LeaveType.COMPASSIONATE, year,
                BigDecimal.valueOf(5), BigDecimal.ZERO);

        when(policyRepository.findByTenantIdAndActiveTrue(TENANT_ID))
                .thenReturn(List.of()); // empty policies
        when(balanceRepository.findActiveBalancesForYear(TENANT_ID, year))
                .thenReturn(List.of(balance));

        leaveBalanceService.runMonthlyAccrual(TENANT_ID);

        // Accrual should not have been saved for skipped balance
        verify(balanceRepository, times(0)).save(any());
        assertThat(balance.getAccrued()).isEqualByComparingTo("5"); // unchanged
    }
}
