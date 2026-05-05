// Kenya statutory rates — effective March 2025
// Single source of truth. Update this file only when KRA publishes new rates.

export const PAYE_BANDS = [
  { limit: 24_000, rate: 0.10 },
  { limit: 32_333, rate: 0.25 },
  { limit: 500_000, rate: 0.30 },
  { limit: 800_000, rate: 0.325 },
  { limit: Infinity, rate: 0.35 },
] as const;

export const PERSONAL_RELIEF = 2_400; // KES per month

// NSSF Act 2013 (as in effect)
export const NSSF_TIER1_LIMIT = 7_000;  // Lower Earnings Limit
export const NSSF_TIER2_LIMIT = 43_000; // Upper Earnings Limit (7,000 + 36,000)
export const NSSF_RATE = 0.06;

// SHIF (replaced NHIF October 2024)
export const SHIF_RATE = 0.0275;

// Housing Levy
export const HOUSING_LEVY_RATE = 0.015;

export const RATES_EFFECTIVE_DATE = "1 March 2025";
