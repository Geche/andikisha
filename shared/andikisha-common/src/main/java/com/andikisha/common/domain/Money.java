package com.andikisha.common.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.Getter;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Objects;

@Getter
@Embeddable
public class Money {

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false, length = 3)
    private String currency;

    protected Money() {}

    private Money(BigDecimal amount, String currency) {
        if (amount == null) throw new IllegalArgumentException("Amount cannot be null");
        if (currency == null || currency.isBlank()) throw new IllegalArgumentException("Currency cannot be blank");
        this.amount = amount.setScale(2, RoundingMode.HALF_UP);
        this.currency = currency.toUpperCase();
    }

    public static Money kes(BigDecimal amount) {
        return new Money(amount, "KES");
    }

    public static Money kes(long amount) {
        return new Money(BigDecimal.valueOf(amount), "KES");
    }

    public static Money kes(double amount) {
        return new Money(BigDecimal.valueOf(amount), "KES");
    }

    public static Money of(BigDecimal amount, String currency) {
        return new Money(amount, currency);
    }

    public static Money zero(String currency) {
        return new Money(BigDecimal.ZERO, currency);
    }

    public Money add(Money other) {
        assertSameCurrency(other);
        return new Money(this.amount.add(other.amount), this.currency);
    }

    public Money subtract(Money other) {
        assertSameCurrency(other);
        return new Money(this.amount.subtract(other.amount), this.currency);
    }

    public Money multiply(BigDecimal factor) {
        return new Money(
                this.amount.multiply(factor).setScale(2, RoundingMode.HALF_UP),
                this.currency
        );
    }

    public Money multiply(double factor) {
        return multiply(BigDecimal.valueOf(factor));
    }

    public Money percentage(BigDecimal percent) {
        BigDecimal factor = percent.divide(BigDecimal.valueOf(100), 10, RoundingMode.HALF_UP);
        return multiply(factor);
    }

    public Money min(Money other) {
        assertSameCurrency(other);
        return this.amount.compareTo(other.amount) <= 0 ? this : other;
    }

    public Money max(Money other) {
        assertSameCurrency(other);
        return this.amount.compareTo(other.amount) >= 0 ? this : other;
    }

    public boolean isPositive() {
        return amount.compareTo(BigDecimal.ZERO) > 0;
    }

    public boolean isZero() {
        return amount.compareTo(BigDecimal.ZERO) == 0;
    }

    public boolean isGreaterThan(Money other) {
        assertSameCurrency(other);
        return this.amount.compareTo(other.amount) > 0;
    }

    public boolean isLessThan(Money other) {
        assertSameCurrency(other);
        return this.amount.compareTo(other.amount) < 0;
    }

    private void assertSameCurrency(Money other) {
        if (!this.currency.equals(other.currency)) {
            throw new IllegalArgumentException(
                    "Cannot combine " + this.currency + " with " + other.currency
            );
        }
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Money money = (Money) o;
        return amount.compareTo(money.amount) == 0
                && Objects.equals(currency, money.currency);
    }

    @Override
    public int hashCode() {
        return Objects.hash(amount.stripTrailingZeros(), currency);
    }

    @Override
    public String toString() {
        return currency + " " + amount.toPlainString();
    }
}