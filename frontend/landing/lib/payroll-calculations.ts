import {
  PAYE_BANDS,
  PERSONAL_RELIEF,
  NSSF_RATE,
  NSSF_TIER1_LIMIT,
  NSSF_TIER2_LIMIT,
  SHIF_RATE,
  HOUSING_LEVY_RATE,
} from "./kenya-tax-rates-2025";

export interface PayrollInput {
  grossMonthly: number;
  pensionPercent?: number; // % of gross, pre-tax
  helbDeduction?: number;  // flat KES
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

export function calculatePAYE(taxableIncome: number): number {
  let tax = 0;
  let prev = 0;

  for (const band of PAYE_BANDS) {
    if (taxableIncome <= prev) break;
    const slice = Math.min(taxableIncome, band.limit) - prev;
    tax += slice * band.rate;
    prev = band.limit;
  }

  return Math.max(0, tax - PERSONAL_RELIEF);
}

export function calculateNSSF(gross: number): { tier1: number; tier2: number } {
  const tier1 = Math.min(gross, NSSF_TIER1_LIMIT) * NSSF_RATE;
  const tier2 = Math.max(0, Math.min(gross, NSSF_TIER2_LIMIT) - NSSF_TIER1_LIMIT) * NSSF_RATE;
  return { tier1, tier2 };
}

export function calculatePayroll(input: PayrollInput): PayrollResult {
  const { grossMonthly, pensionPercent = 0, helbDeduction = 0 } = input;
  const gross = Math.max(0, grossMonthly);

  const pension = gross * (pensionPercent / 100);
  const taxableIncome = gross - pension;

  const paye = calculatePAYE(taxableIncome);
  const { tier1: nssfTier1, tier2: nssfTier2 } = calculateNSSF(gross);
  const shif = gross * SHIF_RATE;
  const housingLevy = gross * HOUSING_LEVY_RATE;
  const helb = Math.max(0, helbDeduction);

  const totalDeductions = paye + nssfTier1 + nssfTier2 + shif + housingLevy + pension + helb;
  const netPay = gross - totalDeductions;

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
    netPay: round2(netPay),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
