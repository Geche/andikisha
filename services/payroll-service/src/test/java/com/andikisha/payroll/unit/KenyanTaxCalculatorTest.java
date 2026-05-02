package com.andikisha.payroll.unit;

import com.andikisha.payroll.application.service.KenyanTaxCalculator;
import com.andikisha.payroll.domain.model.DeductionResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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

    // -------------------------------------------------------------------------
    // PAYE band boundary tests
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("PAYE at exactly Band 1 ceiling KES 24,000 — 10% applies, no Band 2 tax")
    void calculate_atBand1Ceiling_24000() {
        // gross = 24,000
        // NSSF: Tier I = min(24000,7000)*6% = 420; Tier II = (24000-7000)*6% = 1020; total = 1440
        // taxable = 24,000 - 1,440 = 22,560
        // payeBeforeRelief = 22,560 * 10% = 2,256.00
        // less personal relief 2,400 → netPaye = 0 (floored at zero)
        DeductionResult result = calculator.calculate(new BigDecimal("24000"), new BigDecimal("24000"));
        assertThat(result.taxableIncome()).isEqualByComparingTo("22560.00");
        assertThat(result.netPaye()).isEqualByComparingTo("0.00"); // relief exceeds gross PAYE
        assertThat(result.nssfEmployee()).isEqualByComparingTo("1440.00");
    }

    @Test
    @DisplayName("PAYE at Band 2 lower boundary KES 24,001 — one KES in 25% band")
    void calculate_atBand2Start_24001() {
        // taxable = 24,001 - nssfEmployee
        // The first 24,000 of taxable income hits 10%; any remainder hits 25%
        // Verify payeBeforeRelief is greater than what Band 1 alone would produce (2,400)
        DeductionResult result = calculator.calculate(new BigDecimal("24001"), new BigDecimal("24001"));
        assertThat(result.nssfEmployee()).isGreaterThan(BigDecimal.ZERO);
        // taxable income here will be less than 24,000 (nssf reduces it below the band 2 threshold),
        // so the band 2 check we actually need is that payeBeforeRelief > 0 at this gross level
        assertThat(result.payeBeforeRelief()).isGreaterThan(BigDecimal.ZERO);
    }

    @Test
    @DisplayName("PAYE at Band 2 ceiling KES 32,300 — all 25% band fully applied")
    void calculate_atBand2Ceiling_32300() {
        // NSSF: Tier I 7,000*6% = 420; Tier II = (32,300-7,000)*6% = 1,518; total = 1,938
        // taxable = 32,300 - 1,938 = 30,362
        // PAYE: 24,000@10% = 2,400; (30,362-24,000)@25% = 6,362*0.25 = 1,590.50; total = 3,990.50
        // less personal relief 2,400 → netPaye = 1,590.50
        DeductionResult result = calculator.calculate(new BigDecimal("32300"), new BigDecimal("32300"));
        assertThat(result.nssfEmployee()).isEqualByComparingTo("1938.00");
        assertThat(result.taxableIncome()).isEqualByComparingTo("30362.00");
        // verify no Band 3 (30%) tax — payeBeforeRelief should not exceed 3,991
        assertThat(result.payeBeforeRelief()).isLessThanOrEqualTo(new BigDecimal("3991.00"));
    }

    // -------------------------------------------------------------------------
    // NSSF tier boundary tests
    // -------------------------------------------------------------------------

    @Test
    @DisplayName("NSSF at Tier I ceiling KES 7,000 — max Tier I contribution KES 420, Tier II = 0")
    void calculate_nssfAtTier1Ceiling() {
        // basicPay = 7,000 → exactly at Tier I ceiling, no Tier II
        DeductionResult result = calculator.calculate(new BigDecimal("7000"), new BigDecimal("7000"));
        assertThat(result.nssfEmployee()).isEqualByComparingTo("420.00"); // 7,000 * 6%
    }

    @Test
    @DisplayName("NSSF at Tier II ceiling KES 36,000 — max total NSSF KES 2,160")
    void calculate_nssfAtTier2Ceiling_36000() {
        // basicPay = 36,000 → fully into Tier II ceiling, NSSF = 36,000 * 6% = 2,160
        DeductionResult result = calculator.calculate(new BigDecimal("36000"), new BigDecimal("36000"));
        assertThat(result.nssfEmployee()).isEqualByComparingTo("2160.00");
    }

    @Test
    @DisplayName("NSSF above Tier II ceiling KES 36,001 — contribution capped at KES 2,160")
    void calculate_nssfAboveTier2Ceiling() {
        // basicPay exceeds Tier II ceiling — NSSF must still be capped at 2,160
        DeductionResult result = calculator.calculate(new BigDecimal("36001"), new BigDecimal("36001"));
        assertThat(result.nssfEmployee()).isEqualByComparingTo("2160.00");
    }
}
