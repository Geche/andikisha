package com.andikisha.leave.unit;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.leave.domain.model.LeaveBalance;
import com.andikisha.leave.domain.model.LeaveType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LeaveBalanceDomainTest {

    private static final String TENANT_ID   = "tenant-1";
    private static final UUID   EMPLOYEE_ID = UUID.randomUUID();

    private LeaveBalance balance;

    @BeforeEach
    void setUp() {
        balance = LeaveBalance.create(
                TENANT_ID, EMPLOYEE_ID, LeaveType.ANNUAL, 2026,
                BigDecimal.valueOf(21), BigDecimal.valueOf(5));
    }

    // ------------------------------------------------------------------
    // getAvailable
    // ------------------------------------------------------------------

    @Test
    void getAvailable_returnsAccruedPlusCarryOverMinusUsed() {
        assertThat(balance.getAvailable()).isEqualByComparingTo("26"); // 21 + 5
    }

    // ------------------------------------------------------------------
    // deduct
    // ------------------------------------------------------------------

    @Test
    void deduct_reducesUsedBalance() {
        balance.deduct(BigDecimal.valueOf(3));
        assertThat(balance.getUsed()).isEqualByComparingTo("3");
        assertThat(balance.getAvailable()).isEqualByComparingTo("23");
    }

    @Test
    void deduct_exactBalance_succeeds() {
        balance.deduct(BigDecimal.valueOf(26)); // exactly available
        assertThat(balance.getAvailable()).isEqualByComparingTo("0");
    }

    @Test
    void deduct_zeroDays_throwsBusinessRule() {
        assertThatThrownBy(() -> balance.deduct(BigDecimal.ZERO))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("positive");
    }

    @Test
    void deduct_negativeDays_throwsBusinessRule() {
        assertThatThrownBy(() -> balance.deduct(BigDecimal.valueOf(-1)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("positive");
    }

    @Test
    void deduct_exceedsAvailable_throwsBusinessRule() {
        assertThatThrownBy(() -> balance.deduct(BigDecimal.valueOf(27)))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Insufficient");
    }

    @Test
    void deduct_whenFrozen_throwsBusinessRule() {
        balance.freeze();
        assertThatThrownBy(() -> balance.deduct(BigDecimal.ONE))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("frozen");
    }

    // ------------------------------------------------------------------
    // restore
    // ------------------------------------------------------------------

    @Test
    void restore_addsDaysBackToUsed() {
        balance.deduct(BigDecimal.valueOf(5));
        balance.restore(BigDecimal.valueOf(3));
        assertThat(balance.getUsed()).isEqualByComparingTo("2");
        assertThat(balance.getAvailable()).isEqualByComparingTo("24");
    }

    @Test
    void restore_doesNotGoBelowZeroUsed() {
        // No days used yet; restoring more than used clamps at zero
        balance.restore(BigDecimal.valueOf(10));
        assertThat(balance.getUsed()).isEqualByComparingTo("0");
    }

    @Test
    void restore_zeroDays_isNoOp() {
        balance.deduct(BigDecimal.valueOf(3));
        balance.restore(BigDecimal.ZERO);
        assertThat(balance.getUsed()).isEqualByComparingTo("3");
    }

    // ------------------------------------------------------------------
    // accrue
    // ------------------------------------------------------------------

    @Test
    void accrue_increasesAccruedBalance() {
        balance.accrue(BigDecimal.valueOf(1.75));
        assertThat(balance.getAccrued()).isEqualByComparingTo("22.75");
    }

    @Test
    void accrue_whenFrozen_isNoOp() {
        balance.freeze();
        balance.accrue(BigDecimal.valueOf(5));
        assertThat(balance.getAccrued()).isEqualByComparingTo("21"); // unchanged
    }

    // ------------------------------------------------------------------
    // freeze
    // ------------------------------------------------------------------

    @Test
    void freeze_setsFrozenTrue() {
        assertThat(balance.isFrozen()).isFalse();
        balance.freeze();
        assertThat(balance.isFrozen()).isTrue();
    }
}
