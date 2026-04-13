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
@Table(name = "tax_brackets")
public class TaxBracket extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 5)
    private Country country;

    @Column(name = "band_number", nullable = false)
    private int bandNumber;

    @Column(name = "lower_bound", nullable = false, precision = 15, scale = 2)
    private BigDecimal lowerBound;

    @Column(name = "upper_bound", precision = 15, scale = 2)
    private BigDecimal upperBound;

    @Column(nullable = false, precision = 5, scale = 4)
    private BigDecimal rate;

    @Column(name = "effective_from", nullable = false)
    private LocalDate effectiveFrom;

    @Column(name = "effective_to")
    private LocalDate effectiveTo;

    @Column(name = "is_active", nullable = false)
    private boolean active = true;

    protected TaxBracket() {}

    public static TaxBracket create(String tenantId, Country country,
                                    int bandNumber, BigDecimal lowerBound,
                                    BigDecimal upperBound, BigDecimal rate,
                                    LocalDate effectiveFrom) {
        TaxBracket bracket = new TaxBracket();
        bracket.setTenantId(tenantId);
        bracket.country = country;
        bracket.bandNumber = bandNumber;
        bracket.lowerBound = lowerBound;
        bracket.upperBound = upperBound;
        bracket.rate = rate;
        bracket.effectiveFrom = effectiveFrom;
        bracket.active = true;
        return bracket;
    }

    public void expire(LocalDate effectiveTo) {
        this.effectiveTo = effectiveTo;
        this.active = false;
    }

    public Country getCountry() { return country; }
    public int getBandNumber() { return bandNumber; }
    public BigDecimal getLowerBound() { return lowerBound; }
    public BigDecimal getUpperBound() { return upperBound; }
    public BigDecimal getRate() { return rate; }
    public LocalDate getEffectiveFrom() { return effectiveFrom; }
    public LocalDate getEffectiveTo() { return effectiveTo; }
    public boolean isActive() { return active; }
}