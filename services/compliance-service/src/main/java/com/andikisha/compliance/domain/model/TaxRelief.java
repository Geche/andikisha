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
@Table(name = "tax_reliefs")
public class TaxRelief extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 5)
    private Country country;

    @Column(name = "relief_type", nullable = false, length = 50)
    private String reliefType;

    @Column(name = "monthly_amount", precision = 15, scale = 2)
    private BigDecimal monthlyAmount;

    @Column(name = "rate", precision = 5, scale = 4)
    private BigDecimal rate;

    @Column(name = "max_amount", precision = 15, scale = 2)
    private BigDecimal maxAmount;

    @Column(length = 500)
    private String description;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    protected TaxRelief() {}

    public static TaxRelief create(String tenantId, Country country,
                                   String reliefType, BigDecimal monthlyAmount,
                                   BigDecimal rate, BigDecimal maxAmount,
                                   String description, LocalDate effectiveFrom) {
        TaxRelief relief = new TaxRelief();
        relief.setTenantId(tenantId);
        relief.country = country;
        relief.reliefType = reliefType;
        relief.monthlyAmount = monthlyAmount;
        relief.rate = rate;
        relief.maxAmount = maxAmount;
        relief.description = description;
        relief.effectiveFrom = effectiveFrom;
        relief.active = true;
        return relief;
    }

    public void expire(LocalDate effectiveTo) {
        this.effectiveTo = effectiveTo;
        this.active = false;
    }

    public Country getCountry() { return country; }
    public String getReliefType() { return reliefType; }
    public BigDecimal getMonthlyAmount() { return monthlyAmount; }
    public BigDecimal getRate() { return rate; }
    public BigDecimal getMaxAmount() { return maxAmount; }
    public String getDescription() { return description; }
    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public LocalDate getEffectiveTo() { return effectiveTo; }
    public boolean isActive() { return active; }
}