package com.andikisha.employee.domain.model;

import com.andikisha.common.domain.Money;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.Embedded;
import lombok.Getter;

@Getter
@Embeddable
public class SalaryStructure {

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "amount",   column = @Column(name = "basic_salary_amount")),
            @AttributeOverride(name = "currency", column = @Column(name = "salary_currency"))
    })
    private Money basicSalary;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "amount",   column = @Column(name = "housing_allowance_amount")),
            @AttributeOverride(name = "currency", column = @Column(name = "housing_allowance_currency"))
    })
    private Money housingAllowance;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "amount",   column = @Column(name = "transport_allowance_amount")),
            @AttributeOverride(name = "currency", column = @Column(name = "transport_allowance_currency"))
    })
    private Money transportAllowance;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "amount",   column = @Column(name = "medical_allowance_amount")),
            @AttributeOverride(name = "currency", column = @Column(name = "medical_allowance_currency"))
    })
    private Money medicalAllowance;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "amount",   column = @Column(name = "other_allowances_amount")),
            @AttributeOverride(name = "currency", column = @Column(name = "other_allowances_currency"))
    })
    private Money otherAllowances;

    protected SalaryStructure() {}

    public SalaryStructure(Money basicSalary, Money housingAllowance,
                           Money transportAllowance, Money medicalAllowance,
                           Money otherAllowances) {
        this.basicSalary = basicSalary;
        this.housingAllowance    = housingAllowance    != null ? housingAllowance    : Money.zero(basicSalary.getCurrency());
        this.transportAllowance  = transportAllowance  != null ? transportAllowance  : Money.zero(basicSalary.getCurrency());
        this.medicalAllowance    = medicalAllowance    != null ? medicalAllowance    : Money.zero(basicSalary.getCurrency());
        this.otherAllowances     = otherAllowances     != null ? otherAllowances     : Money.zero(basicSalary.getCurrency());
    }

    public Money grossPay() {
        return basicSalary
                .add(housingAllowance)
                .add(transportAllowance)
                .add(medicalAllowance)
                .add(otherAllowances);
    }

}
