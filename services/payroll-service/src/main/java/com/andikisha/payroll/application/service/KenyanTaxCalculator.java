package com.andikisha.payroll.application.service;

import com.andikisha.payroll.domain.model.DeductionResult;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Component
public class KenyanTaxCalculator {

    // PAYE brackets (monthly, FY 2024/2025)
    private static final BigDecimal BAND_1_LIMIT = bd(24000);
    private static final BigDecimal BAND_2_LIMIT = bd(32300);
    private static final BigDecimal BAND_3_LIMIT = bd(500000);
    private static final BigDecimal BAND_4_LIMIT = bd(800000);

    private static final BigDecimal RATE_1 = bd("0.10");
    private static final BigDecimal RATE_2 = bd("0.25");
    private static final BigDecimal RATE_3 = bd("0.30");
    private static final BigDecimal RATE_4 = bd("0.325");
    private static final BigDecimal RATE_5 = bd("0.35");

    // Reliefs
    private static final BigDecimal PERSONAL_RELIEF      = bd(2400);
    private static final BigDecimal INSURANCE_RELIEF_RATE = bd("0.15");
    private static final BigDecimal MAX_INSURANCE_RELIEF  = bd(5000);

    // NSSF (post-February 2024)
    // Applied to pensionable pay (basic salary), not gross including allowances.
    private static final BigDecimal NSSF_TIER_1_LIMIT = bd(7000);
    private static final BigDecimal NSSF_TIER_2_LIMIT = bd(36000);
    private static final BigDecimal NSSF_RATE         = bd("0.06");

    // SHIF (effective October 2024)
    private static final BigDecimal SHIF_RATE = bd("0.0275");

    // Housing Levy (Affordable Housing Levy, Finance Act 2023)
    private static final BigDecimal HOUSING_LEVY_RATE = bd("0.015");

    /**
     * Single-argument form: treats basic pay equal to gross pay.
     * Use for employees with no allowances, or when basic/gross distinction is not needed.
     */
    public DeductionResult calculate(BigDecimal grossPay) {
        return calculate(grossPay, grossPay, BigDecimal.ZERO);
    }

    /**
     * Primary form: separates gross pay (for housing levy, SHIF, PAYE) from
     * basic / pensionable pay (for NSSF only). HELB defaults to zero.
     *
     * @param grossPay  total gross including all allowances — used for SHIF, Housing Levy, PAYE
     * @param basicPay  pensionable pay (basic salary, excluding non-pensionable allowances) — used for NSSF
     */
    public DeductionResult calculate(BigDecimal grossPay, BigDecimal basicPay) {
        return calculate(grossPay, basicPay, BigDecimal.ZERO);
    }

    /**
     * Full form with HELB deduction.
     *
     * @param grossPay       total gross including all allowances
     * @param basicPay       pensionable pay for NSSF calculation
     * @param helbDeduction  monthly HELB loan repayment (0 if not applicable)
     */
    public DeductionResult calculate(BigDecimal grossPay, BigDecimal basicPay,
                                     BigDecimal helbDeduction) {
        // 1. NSSF — applied to pensionable pay (basic salary), not gross
        BigDecimal nssfTier1 = basicPay.min(NSSF_TIER_1_LIMIT).multiply(NSSF_RATE)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal nssfTier2 = BigDecimal.ZERO;
        if (basicPay.compareTo(NSSF_TIER_1_LIMIT) > 0) {
            BigDecimal tier2Earnings = basicPay.subtract(NSSF_TIER_1_LIMIT)
                    .min(NSSF_TIER_2_LIMIT.subtract(NSSF_TIER_1_LIMIT));
            nssfTier2 = tier2Earnings.multiply(NSSF_RATE)
                    .setScale(2, RoundingMode.HALF_UP);
        }
        BigDecimal nssfEmployee = nssfTier1.add(nssfTier2);
        BigDecimal nssfEmployer = nssfEmployee; // employer matches employee contribution

        // 2. Housing Levy — 1.5% of gross
        BigDecimal housingLevyEmployee = grossPay.multiply(HOUSING_LEVY_RATE)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal housingLevyEmployer = housingLevyEmployee;

        // 3. Taxable income for PAYE — gross minus NSSF only.
        //    KRA does not permit the Affordable Housing Levy (AHL) employee contribution
        //    to reduce PAYE taxable income (Finance Act 2023 / KRA guidance).
        BigDecimal taxableIncome = grossPay.subtract(nssfEmployee)
                .max(BigDecimal.ZERO);

        // 4. Graduated PAYE
        BigDecimal payeBeforeRelief = calculateGraduatedTax(taxableIncome);

        // 5. SHIF — 2.75% of gross
        BigDecimal shif = grossPay.multiply(SHIF_RATE)
                .setScale(2, RoundingMode.HALF_UP);

        // 6. Reliefs
        BigDecimal insuranceRelief = shif.multiply(INSURANCE_RELIEF_RATE)
                .min(MAX_INSURANCE_RELIEF)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalRelief = PERSONAL_RELIEF.add(insuranceRelief);

        // 7. Net PAYE
        BigDecimal netPaye = payeBeforeRelief.subtract(totalRelief)
                .max(BigDecimal.ZERO)
                .setScale(2, RoundingMode.HALF_UP);

        // 8. Total deductions
        BigDecimal helb = helbDeduction != null ? helbDeduction : BigDecimal.ZERO;
        BigDecimal totalDeductions = netPaye.add(nssfEmployee).add(shif)
                .add(housingLevyEmployee).add(helb);

        // 9. Net pay
        BigDecimal netPay = grossPay.subtract(totalDeductions)
                .setScale(2, RoundingMode.HALF_UP);

        return new DeductionResult(
                grossPay,
                taxableIncome,
                payeBeforeRelief,
                PERSONAL_RELIEF,
                insuranceRelief,
                netPaye,
                nssfEmployee,
                nssfEmployer,
                shif,
                housingLevyEmployee,
                housingLevyEmployer,
                totalDeductions,
                netPay
        );
    }

    private BigDecimal calculateGraduatedTax(BigDecimal taxable) {
        BigDecimal tax       = BigDecimal.ZERO;
        BigDecimal remaining = taxable;

        // Band 1: 0 – 24,000 at 10%
        tax      = tax.add(applyBand(remaining, BAND_1_LIMIT, RATE_1));
        remaining = remaining.subtract(BAND_1_LIMIT).max(BigDecimal.ZERO);

        // Band 2: 24,001 – 32,333 at 25%
        BigDecimal band2Width = BAND_2_LIMIT.subtract(BAND_1_LIMIT);
        tax      = tax.add(applyBand(remaining, band2Width, RATE_2));
        remaining = remaining.subtract(band2Width).max(BigDecimal.ZERO);

        // Band 3: 32,334 – 500,000 at 30%
        BigDecimal band3Width = BAND_3_LIMIT.subtract(BAND_2_LIMIT);
        tax      = tax.add(applyBand(remaining, band3Width, RATE_3));
        remaining = remaining.subtract(band3Width).max(BigDecimal.ZERO);

        // Band 4: 500,001 – 800,000 at 32.5%
        BigDecimal band4Width = BAND_4_LIMIT.subtract(BAND_3_LIMIT);
        tax      = tax.add(applyBand(remaining, band4Width, RATE_4));
        remaining = remaining.subtract(band4Width).max(BigDecimal.ZERO);

        // Band 5: above 800,000 at 35%
        tax = tax.add(remaining.multiply(RATE_5));

        return tax.setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal applyBand(BigDecimal remaining, BigDecimal bandWidth, BigDecimal rate) {
        return remaining.min(bandWidth).max(BigDecimal.ZERO).multiply(rate);
    }

    private static BigDecimal bd(long value) {
        return BigDecimal.valueOf(value);
    }

    private static BigDecimal bd(String value) {
        return new BigDecimal(value);
    }
}
