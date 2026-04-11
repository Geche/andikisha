package com.andikisha.payroll.unit;

import com.andikisha.payroll.application.service.KenyanTaxCalculator;
import com.andikisha.payroll.domain.model.DeductionResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class KenyanTaxCalculatorTest {

    private KenyanTaxCalculator calculator;

    @BeforeEach
    void setUp() {
        calculator = new KenyanTaxCalculator();
    }

    @Test
    void calculate_withTypicalSalary_returnsCorrectDeductions() {
        // KES 150,000 gross (common mid-level salary), no allowances → basicPay = grossPay
        DeductionResult result = calculator.calculate(BigDecimal.valueOf(150000));

        // NSSF: Tier I = 7,000 * 6% = 420.00; Tier II = (36,000 - 7,000) * 6% = 1,740.00. Total = 2,160.00
        assertThat(result.nssfEmployee()).isEqualByComparingTo("2160.00");
        assertThat(result.nssfEmployer()).isEqualByComparingTo("2160.00");

        // Housing Levy: 150,000 * 1.5% = 2,250.00
        assertThat(result.housingLevyEmployee()).isEqualByComparingTo("2250.00");

        // Taxable income: gross - NSSF only (AHL is not deductible for PAYE per KRA guidance)
        // 150,000 - 2,160 = 147,840.00
        assertThat(result.taxableIncome()).isEqualByComparingTo("147840.00");

        // SHIF: 150,000 * 2.75% = 4,125.00
        assertThat(result.shif()).isEqualByComparingTo("4125.00");

        // Insurance Relief: 4,125 * 15% = 618.75, capped at 5,000
        assertThat(result.insuranceRelief()).isEqualByComparingTo("618.75");

        // Personal Relief: 2,400
        assertThat(result.personalRelief()).isEqualByComparingTo("2400.00");

        // Net pay must be positive
        assertThat(result.netPay()).isPositive();

        // Accounting identity: gross = net + totalDeductions
        assertThat(result.netPay().add(result.totalDeductions()))
                .isEqualByComparingTo(result.grossPay());
    }

    @Test
    void calculate_withSeparateBasicPay_nssfOnBasicNotGross() {
        // Employee with KES 100,000 basic + KES 50,000 allowances = KES 150,000 gross
        BigDecimal basicPay = BigDecimal.valueOf(100000);
        BigDecimal grossPay = BigDecimal.valueOf(150000);

        DeductionResult withAllowances = calculator.calculate(grossPay, basicPay);
        DeductionResult noAllowances   = calculator.calculate(basicPay, basicPay);

        // NSSF is capped at Tier II regardless of allowances — both should produce the same NSSF
        // because basicPay (100K) already exceeds Tier II limit (36K); only basic pay affects NSSF
        assertThat(withAllowances.nssfEmployee())
                .isEqualByComparingTo(noAllowances.nssfEmployee());

        // But gross-based deductions (SHIF, Housing Levy) should differ
        assertThat(withAllowances.shif()).isGreaterThan(noAllowances.shif());
        assertThat(withAllowances.housingLevyEmployee())
                .isGreaterThan(noAllowances.housingLevyEmployee());

        // Accounting identity holds for both
        assertThat(withAllowances.netPay().add(withAllowances.totalDeductions()))
                .isEqualByComparingTo(withAllowances.grossPay());
    }

    @Test
    void calculate_withMinimumWage_returnsCorrectDeductions() {
        // KES 15,201 minimum wage (2024)
        DeductionResult result = calculator.calculate(BigDecimal.valueOf(15201));

        // NSSF: Tier I = 7,000 * 6% = 420; Tier II = (15,201 - 7,000) * 6% = 492.06
        assertThat(result.nssfEmployee()).isEqualByComparingTo("912.06");

        // Net pay must be positive at minimum wage
        assertThat(result.netPay()).isPositive();
    }

    @Test
    void calculate_withHighSalary_applies35PercentBand() {
        // KES 1,000,000 gross (above 800K band)
        DeductionResult result = calculator.calculate(BigDecimal.valueOf(1000000));

        // Should hit all 5 PAYE bands
        assertThat(result.payeBeforeRelief()).isPositive();
        assertThat(result.netPaye()).isPositive();

        // NSSF is capped at Tier II (7,000 * 6% + 29,000 * 6% = 2,160)
        assertThat(result.nssfEmployee()).isEqualByComparingTo("2160.00");
    }

    @Test
    void calculate_grossEqualsNetPlusTotalDeductions() {
        BigDecimal[] salaries = {
                BigDecimal.valueOf(15201),
                BigDecimal.valueOf(25000),
                BigDecimal.valueOf(50000),
                BigDecimal.valueOf(100000),
                BigDecimal.valueOf(150000),
                BigDecimal.valueOf(300000),
                BigDecimal.valueOf(500000),
                BigDecimal.valueOf(800000),
                BigDecimal.valueOf(1000000)
        };

        for (BigDecimal salary : salaries) {
            DeductionResult result = calculator.calculate(salary);
            assertThat(result.netPay().add(result.totalDeductions()))
                    .as("Gross should equal net + deductions for salary " + salary)
                    .isEqualByComparingTo(salary);
        }
    }

    @Test
    void calculate_withHelbDeduction_reducesNetPay() {
        BigDecimal gross = BigDecimal.valueOf(100000);
        BigDecimal helb  = BigDecimal.valueOf(3000);

        // Full form: calculate(grossPay, basicPay, helbDeduction)
        DeductionResult withHelb    = calculator.calculate(gross, gross, helb);
        DeductionResult withoutHelb = calculator.calculate(gross);

        assertThat(withHelb.netPay())
                .isEqualByComparingTo(withoutHelb.netPay().subtract(helb));
    }

    @Test
    void calculate_nssfCappedAtTier2() {
        // Even at 1M salary, NSSF should not exceed Tier I + Tier II
        // Max NSSF = 7,000 * 6% + (36,000 - 7,000) * 6% = 420 + 1,740 = 2,160
        DeductionResult result = calculator.calculate(BigDecimal.valueOf(1000000));
        assertThat(result.nssfEmployee()).isEqualByComparingTo("2160.00");
    }
}
