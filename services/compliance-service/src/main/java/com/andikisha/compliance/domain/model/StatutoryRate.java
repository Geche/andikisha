package com.andikisha.compliance.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "statutory_rates")
public class StatutoryRate extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 5)
    private Country country;

    @Column(name = "rate_type", nullable = false, length = 50)
    private String rateType;

    @Column(name = "rate_value", nullable = false, precision = 10, scale = 6)
    private BigDecimal rateValue;

    @Column(name = "limit_amount", precision = 15, scale = 2)
    private BigDecimal limitAmount;

    @Column(name = "secondary_limit", precision = 15, scale = 2)
    private BigDecimal secondaryLimit;

    @Column(name = "fixed_amount", precision = 15, scale = 2)
    private BigDecimal fixedAmount;

    @Column(length = 500)
    private String description;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    protected StatutoryRate() {}

    public static StatutoryRate create(String tenantId, Country country,
                                       String rateType, BigDecimal rateValue,
                                       BigDecimal limitAmount, BigDecimal secondaryLimit,
                                       BigDecimal fixedAmount, String description,
                                       LocalDate effectiveFrom) {
        StatutoryRate rate = new StatutoryRate();
        rate.setTenantId(tenantId);
        rate.country = country;
        rate.rateType = rateType;
        rate.rateValue = rateValue;
        rate.limitAmount = limitAmount;
        rate.secondaryLimit = secondaryLimit;
        rate.fixedAmount = fixedAmount;
        rate.description = description;
        rate.effectiveFrom = effectiveFrom;
        rate.active = true;
        return rate;
    }

    public void expire(LocalDate effectiveTo) {
        this.effectiveTo = effectiveTo;
        this.active = false;
    }

    public Country getCountry() { return country; }
    public String getRateType() { return rateType; }
    public BigDecimal getRateValue() { return rateValue; }
    public BigDecimal getLimitAmount() { return limitAmount; }
    public BigDecimal getSecondaryLimit() { return secondaryLimit; }
    public BigDecimal getFixedAmount() { return fixedAmount; }
    public String getDescription() { return description; }
    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public LocalDate getEffectiveTo() { return effectiveTo; }
    public boolean isActive() { return active; }
}