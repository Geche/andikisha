// Payslip computation driven entirely by rates fetched from the Compliance
// Service (the single source of truth) via /api/compliance-rates. No statutory
// rate values are hardcoded on the landing side — only the application logic
// lives here, and it operates on whatever rates the endpoint returns, so it
// never drifts when a Finance Bill changes a rate.

export interface PayrollInput {
  grossMonthly: number;
  pensionPercent?: number;
  helbDeduction?: number;
}

export interface PayrollResult {
  gross: number;
  paye: number;
  nssfTier1: number;
  nssfTier2: number;
  shif: number;
  housingLevy: number;
  pension: number;
  helb: number;
  totalDeductions: number;
  netPay: number;
}

/** Normalised rate set derived from the Compliance summary. */
export interface StatutoryRates {
  payeBands: { limit: number; rate: number }[]; // limit = upper bound (Infinity = top band)
  personalRelief: number;
  nssfRate: number;
  nssfTier1Limit: number;
  nssfTier2Limit: number;
  shifRate: number;
  housingRate: number;
  effectiveDate: string;
}

/** Raw shape returned by GET /api/v1/public/compliance/{country}/rates. */
interface RawSummary {
  effectiveDate: string;
  taxBrackets: { bandNumber: number; lowerBound: number; upperBound?: number | null; rate: number }[];
  statutoryRates: { rateType: string; rateValue: number; limitAmount?: number | null; secondaryLimit?: number | null }[];
  taxReliefs: { reliefType: string; monthlyAmount?: number | null }[];
}

export function toRates(s: RawSummary): StatutoryRates {
  const byType = (t: string) => s.statutoryRates.find((r) => r.rateType === t);
  const nssf = byType("NSSF");
  const tier1 = nssf?.limitAmount ?? 0;
  const tier2Increment = nssf?.secondaryLimit ?? 0;
  return {
    payeBands: [...s.taxBrackets]
      .sort((a, b) => a.bandNumber - b.bandNumber)
      .map((b) => ({ limit: b.upperBound ?? Infinity, rate: b.rate })),
    personalRelief: s.taxReliefs.find((r) => r.reliefType === "PERSONAL_RELIEF")?.monthlyAmount ?? 0,
    nssfRate: nssf?.rateValue ?? 0,
    nssfTier1Limit: tier1,
    nssfTier2Limit: tier1 + tier2Increment,
    shifRate: byType("SHIF")?.rateValue ?? 0,
    housingRate: byType("HOUSING_LEVY_EMPLOYEE")?.rateValue ?? 0,
    effectiveDate: s.effectiveDate,
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computePayslip(input: PayrollInput, rates: StatutoryRates): PayrollResult {
  const { grossMonthly, pensionPercent = 0, helbDeduction = 0 } = input;
  const gross = Math.max(0, grossMonthly);
  const pension = gross * (pensionPercent / 100);
  const taxableIncome = gross - pension;

  let tax = 0;
  let prev = 0;
  for (const band of rates.payeBands) {
    if (taxableIncome <= prev) break;
    const slice = Math.min(taxableIncome, band.limit) - prev;
    tax += slice * band.rate;
    prev = band.limit;
  }
  const paye = Math.max(0, tax - rates.personalRelief);

  const nssfTier1 = Math.min(gross, rates.nssfTier1Limit) * rates.nssfRate;
  const nssfTier2 = Math.max(0, Math.min(gross, rates.nssfTier2Limit) - rates.nssfTier1Limit) * rates.nssfRate;
  const shif = gross * rates.shifRate;
  const housingLevy = gross * rates.housingRate;
  const helb = Math.max(0, helbDeduction);

  const totalDeductions = paye + nssfTier1 + nssfTier2 + shif + housingLevy + pension + helb;

  return {
    gross,
    paye: round2(paye),
    nssfTier1: round2(nssfTier1),
    nssfTier2: round2(nssfTier2),
    shif: round2(shif),
    housingLevy: round2(housingLevy),
    pension: round2(pension),
    helb: round2(helb),
    totalDeductions: round2(totalDeductions),
    netPay: round2(gross - totalDeductions),
  };
}

// Session-level cache: the calculator fetches rates once per page session. The
// Next route (server) and HTTP Cache-Control headers handle longer-lived caching.
let cache: Promise<StatutoryRates> | null = null;

export function loadRates(): Promise<StatutoryRates> {
  if (!cache) {
    cache = fetch("/api/compliance-rates")
      .then((r) => {
        if (!r.ok) throw new Error("rates unavailable");
        return r.json();
      })
      .then((d: RawSummary) => toRates(d))
      .catch((e) => {
        cache = null; // allow a retry on next mount after a transient failure
        throw e;
      });
  }
  return cache;
}
