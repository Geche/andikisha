package com.andikisha.common.domain;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class MoneyTest {

    // 1. kes(BigDecimal) creates Money with correct amount and currency "KES"
    @Test
    void kes_createsMoneyWithKESCurrencyAndCorrectAmount() {
        Money money = Money.kes(new BigDecimal("5000.00"));

        assertThat(money.getAmount()).isEqualByComparingTo(new BigDecimal("5000.00"));
        assertThat(money.getCurrency()).isEqualTo("KES");
    }

    // 2. of(BigDecimal, String) creates Money with specified currency
    @Test
    void of_createsMoneyWithSpecifiedCurrency() {
        Money money = Money.of(new BigDecimal("100.00"), "USD");

        assertThat(money.getAmount()).isEqualByComparingTo(new BigDecimal("100.00"));
        assertThat(money.getCurrency()).isEqualTo("USD");
    }

    // 3. zero(String) creates Money with zero amount
    @Test
    void zero_createsMoneyWithZeroAmount() {
        Money money = Money.zero("KES");

        assertThat(money.getAmount()).isEqualByComparingTo(BigDecimal.ZERO);
        assertThat(money.getCurrency()).isEqualTo("KES");
    }

    // 4. Constructor normalises scale to 2
    @Test
    void constructor_normalisesScaleToTwo() {
        Money money = Money.kes(new BigDecimal("12500.5"));

        assertThat(money.getAmount().scale()).isEqualTo(2);
        assertThat(money.getAmount()).isEqualByComparingTo(new BigDecimal("12500.50"));
        assertThat(money.getAmount().toPlainString()).isEqualTo("12500.50");
    }

    // 5. add — same currency, result is correct; scale is 2
    @Test
    void add_sameCurrency_returnsCorrectSum() {
        Money a = Money.kes(new BigDecimal("1000.00"));
        Money b = Money.kes(new BigDecimal("500.50"));

        Money result = a.add(b);

        assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("1500.50"));
        assertThat(result.getAmount().scale()).isEqualTo(2);
        assertThat(result.getCurrency()).isEqualTo("KES");
    }

    // 6. subtract — same currency, result is correct
    @Test
    void subtract_sameCurrency_returnsCorrectDifference() {
        Money a = Money.kes(new BigDecimal("2000.00"));
        Money b = Money.kes(new BigDecimal("750.25"));

        Money result = a.subtract(b);

        assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("1249.75"));
        assertThat(result.getCurrency()).isEqualTo("KES");
    }

    // 7. multiply — correct result with scale 2 HALF_UP rounding
    @Test
    void multiply_appliesHalfUpRoundingAtScale2() {
        Money base = Money.kes(new BigDecimal("1000.00"));

        // 1000 * 0.275 = 275.000 -> rounds HALF_UP to 275.00
        Money result = base.multiply(new BigDecimal("0.275"));
        assertThat(result.getAmount()).isEqualByComparingTo(new BigDecimal("275.00"));
        assertThat(result.getAmount().scale()).isEqualTo(2);

        // 1000 * 0.0275 = 27.500 -> rounds HALF_UP to 27.50
        Money result2 = base.multiply(new BigDecimal("0.0275"));
        assertThat(result2.getAmount()).isEqualByComparingTo(new BigDecimal("27.50"));
    }

    // 8. min — returns smaller of two
    @Test
    void min_returnsTheSmallerMoney() {
        Money smaller = Money.kes(new BigDecimal("300.00"));
        Money larger  = Money.kes(new BigDecimal("700.00"));

        assertThat(smaller.min(larger)).isSameAs(smaller);
        assertThat(larger.min(smaller)).isSameAs(smaller);
    }

    @Test
    void min_withEqualAmounts_returnsReceiverInstance() {
        Money a = Money.kes(new BigDecimal("500.00"));
        Money b = Money.kes(new BigDecimal("500.00"));

        // compareTo <= 0 means receiver is returned when equal
        assertThat(a.min(b)).isSameAs(a);
    }

    // 9. isPositive — true for positive, false for zero, false for negative
    @Test
    void isPositive_returnsTrueForPositiveAmount() {
        assertThat(Money.kes(new BigDecimal("0.01")).isPositive()).isTrue();
    }

    @Test
    void isPositive_returnsFalseForZero() {
        assertThat(Money.zero("KES").isPositive()).isFalse();
    }

    @Test
    void isPositive_returnsFalseForNegativeAmount() {
        assertThat(Money.kes(new BigDecimal("-1.00")).isPositive()).isFalse();
    }

    // 10. Currency mismatch on add throws IllegalArgumentException
    @Test
    void add_differentCurrencies_throwsIllegalArgumentException() {
        Money kes = Money.kes(new BigDecimal("100.00"));
        Money usd = Money.of(new BigDecimal("100.00"), "USD");

        assertThatThrownBy(() -> kes.add(usd))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("KES")
                .hasMessageContaining("USD");
    }

    // 11. Currency mismatch on subtract throws IllegalArgumentException
    @Test
    void subtract_differentCurrencies_throwsIllegalArgumentException() {
        Money kes = Money.kes(new BigDecimal("200.00"));
        Money usd = Money.of(new BigDecimal("50.00"), "USD");

        assertThatThrownBy(() -> kes.subtract(usd))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("KES")
                .hasMessageContaining("USD");
    }

    // 12. Currency mismatch on min throws IllegalArgumentException
    @Test
    void min_differentCurrencies_throwsIllegalArgumentException() {
        Money kes = Money.kes(new BigDecimal("100.00"));
        Money usd = Money.of(new BigDecimal("100.00"), "USD");

        assertThatThrownBy(() -> kes.min(usd))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("KES")
                .hasMessageContaining("USD");
    }

    // 13. equals is scale-normalised
    @Test
    void equals_isScaleNormalised() {
        Money a = Money.kes(new BigDecimal("10.00"));
        Money b = Money.kes(new BigDecimal("10.0"));

        assertThat(a).isEqualTo(b);
    }

    // 14. hashCode is consistent with equals
    @Test
    void hashCode_isConsistentWithEquals() {
        Money a = Money.kes(new BigDecimal("10.00"));
        Money b = Money.kes(new BigDecimal("10.0"));

        assertThat(a).isEqualTo(b);
        assertThat(a.hashCode()).isEqualTo(b.hashCode());
    }

    // 15. Null amount in constructor throws IllegalArgumentException
    @Test
    void constructor_nullAmount_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> Money.kes(null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Amount cannot be null");
    }

    // 16. Null currency in constructor throws IllegalArgumentException
    @Test
    void constructor_nullCurrency_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> Money.of(BigDecimal.ONE, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Currency cannot be blank");
    }

    @Test
    void constructor_blankCurrency_throwsIllegalArgumentException() {
        assertThatThrownBy(() -> Money.of(BigDecimal.ONE, "  "))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Currency cannot be blank");
    }

    // 17. 10000.005 rounds to 10000.01 (HALF_UP) via constructor
    @Test
    void constructor_halfUpRounding_roundsHalfAmountUp() {
        Money money = Money.kes(new BigDecimal("10000.005"));

        assertThat(money.getAmount()).isEqualByComparingTo(new BigDecimal("10000.01"));
    }
}
