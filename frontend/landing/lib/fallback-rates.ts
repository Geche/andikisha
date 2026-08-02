import type { RawSummary } from "@/lib/compute-payslip";

// TODO: deviation - see docs/decisions/2026-08-02-landing-calculator-fallback-rates.md
//
// SAFETY NET ONLY. The live calculator is driven by the Compliance Service (the
// single source of truth); compute-payslip.ts hardcodes no rates. This file is
// the one deliberate exception: when the gateway is unreachable, the API route
// serves these standard published Kenyan statutory rates so the marketing
// calculator degrades to a working state instead of a dead error panel.
//
// Consumed ONLY by the server route (app/api/compliance-rates/route.ts), so
// these values never ship in the client bundle. Output computed from them is
// flagged `provisional` and labelled as such in the UI.
//
// These MUST be reviewed whenever a Finance Bill changes a rate. Values mirror
// the Kenya compliance context (PAYE bands, reliefs, NSSF/SHIF/Housing Levy) and
// the payroll engine (KenyanTaxCalculator). Band-2 ceiling is the KRA-gazetted
// 32,333 (388,000 ÷ 12).
export const FALLBACK_RATES_SUMMARY: RawSummary = {
  effectiveDate: "2024-12-27",
  provisional: true,
  taxBrackets: [
    { bandNumber: 1, lowerBound: 0,       upperBound: 24000,  rate: 0.10 },
    { bandNumber: 2, lowerBound: 24001,   upperBound: 32333,  rate: 0.25 },
    { bandNumber: 3, lowerBound: 32334,   upperBound: 500000, rate: 0.30 },
    { bandNumber: 4, lowerBound: 500001,  upperBound: 800000, rate: 0.325 },
    { bandNumber: 5, lowerBound: 800001,  upperBound: null,   rate: 0.35 },
  ],
  statutoryRates: [
    // NSSF: 6% of pensionable pay. Tier I ceiling 7,000, Tier II ceiling 36,000.
    { rateType: "NSSF", rateValue: 0.06, limitAmount: 7000, secondaryLimit: 36000 },
    { rateType: "SHIF", rateValue: 0.0275 },
    { rateType: "HOUSING_LEVY_EMPLOYEE", rateValue: 0.015 },
  ],
  taxReliefs: [
    { reliefType: "PERSONAL_RELIEF", monthlyAmount: 2400 },
    { reliefType: "INSURANCE_RELIEF", rate: 0.15, maxAmount: 5000 },
  ],
};
