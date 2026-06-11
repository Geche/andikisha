"use client";

import { useState, useMemo, useEffect } from "react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { computePayslip, loadRates, type StatutoryRates } from "@/lib/compute-payslip";

function fmt(n: number) {
  return n.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

interface OutputRowProps {
  label: string;
  value: number;
  bold?: boolean;
  deduction?: boolean;
}

function OutputRow({ label, value, bold, deduction }: OutputRowProps) {
  return (
    <div className={`flex items-baseline justify-between py-2.5 ${bold ? "border-t border-ink-200 mt-1 pt-3" : "border-b border-ink-100"}`}>
      <span className={`text-[14px] ${bold ? "font-semibold text-ink-900" : "text-ink-600"}`}>{label}</span>
      <span
        className={`font-mono text-[14px] tabular-nums ${bold ? "font-semibold text-ink-900" : deduction ? "text-ink-700" : "text-ink-900"}`}
        style={{ fontFeatureSettings: '"tnum" 1, "lnum" 1' }}
      >
        {deduction && value > 0 ? "−" : ""}{fmt(value)}
      </span>
    </div>
  );
}

export default function PayrollCalculator() {
  const [gross, setGross] = useState(85_000);
  const [pensionPct, setPensionPct] = useState(0);
  const [helb, setHelb] = useState(0);

  // Statutory rates come from the Compliance Service (single source of truth).
  const [rates, setRates] = useState<StatutoryRates | null>(null);
  const [ratesError, setRatesError] = useState(false);

  useEffect(() => {
    let active = true;
    loadRates()
      .then((r) => { if (active) setRates(r); })
      .catch(() => { if (active) setRatesError(true); });
    return () => { active = false; };
  }, []);

  const result = useMemo(
    () => (rates ? computePayslip({ grossMonthly: gross, pensionPercent: pensionPct, helbDeduction: helb }, rates) : null),
    [gross, pensionPct, helb, rates]
  );

  return (
    <section id="calculator" className="bg-surface-alt py-24 scroll-mt-[72px]">
      <Container>
        <div className="mb-12">
          <Eyebrow className="mb-4">Live payroll engine</Eyebrow>
          <h2
            className="font-display font-bold text-ink-900 mb-3"
            style={{ fontSize: "clamp(2.25rem, 4vw, 3.5rem)", lineHeight: "1.05", letterSpacing: "-0.015em" }}
          >
            Try the engine.
            <br />
            <span className="text-brand-700">Real KES rates. Live.</span>
          </h2>
          <p className="text-[17px] text-ink-600 max-w-[480px]">
            Type a salary and see every statutory deduction calculated to the cent using current KRA rates.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left — inputs */}
          <div className="bg-white rounded-2xl border border-ink-200 p-6 lg:p-8">
            <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink-400 mb-6">Inputs</p>

            <div className="flex flex-col gap-6">
              {/* Gross salary */}
              <div>
                <label htmlFor="gross" className="block text-[14px] font-semibold text-ink-900 mb-2">
                  Gross monthly salary (KES)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-mono text-ink-400">KES</span>
                  <input
                    id="gross"
                    type="number"
                    min={0}
                    max={10_000_000}
                    step={1000}
                    value={gross}
                    onChange={(e) => setGross(Math.max(0, Number(e.target.value)))}
                    className="w-full h-11 pl-12 pr-4 rounded-lg border border-ink-200 bg-surface text-ink-900 font-mono text-[15px] tabular-nums focus:outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20 transition-all"
                    style={{ fontFeatureSettings: '"tnum" 1' }}
                  />
                </div>
                <input
                  type="range"
                  min={10000}
                  max={1_000_000}
                  step={5000}
                  value={gross}
                  onChange={(e) => setGross(Number(e.target.value))}
                  className="w-full mt-3 accent-brand-700"
                  aria-label="Gross salary slider"
                />
                <div className="flex justify-between text-[11px] text-ink-400 mt-1">
                  <span>10K</span><span>500K</span><span>1M</span>
                </div>
              </div>

              {/* Pension */}
              <div>
                <label htmlFor="pension" className="block text-[14px] font-semibold text-ink-900 mb-2">
                  Pension contribution (% of gross)
                </label>
                <div className="relative">
                  <input
                    id="pension"
                    type="number"
                    min={0}
                    max={30}
                    step={0.5}
                    value={pensionPct}
                    onChange={(e) => setPensionPct(Math.min(30, Math.max(0, Number(e.target.value))))}
                    className="w-full h-11 px-4 rounded-lg border border-ink-200 bg-surface text-ink-900 font-mono text-[15px] focus:outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-mono text-ink-400">%</span>
                </div>
              </div>

              {/* HELB */}
              <div>
                <label htmlFor="helb" className="block text-[14px] font-semibold text-ink-900 mb-2">
                  HELB deduction (KES)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-mono text-ink-400">KES</span>
                  <input
                    id="helb"
                    type="number"
                    min={0}
                    step={500}
                    value={helb}
                    onChange={(e) => setHelb(Math.max(0, Number(e.target.value)))}
                    className="w-full h-11 pl-12 pr-4 rounded-lg border border-ink-200 bg-surface text-ink-900 font-mono text-[15px] focus:outline-none focus:border-brand-700 focus:ring-2 focus:ring-brand-700/20 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right — output */}
          <div className="bg-white rounded-2xl border border-ink-200 p-6 lg:p-8">
            <p className="text-[13px] font-semibold uppercase tracking-[0.1em] text-ink-400 mb-6">Payslip breakdown</p>

            {ratesError ? (
              <p className="text-[14px] text-ink-600 py-8 text-center">
                Couldn&apos;t load the latest statutory rates. Please refresh to try again.
              </p>
            ) : !result || !rates ? (
              <p className="text-[14px] text-ink-400 py-8 text-center">Loading current KRA rates…</p>
            ) : (
              <>
                <OutputRow label="Gross pay" value={result.gross} />
                <OutputRow label="PAYE" value={result.paye} deduction />
                <OutputRow label="NSSF Tier I" value={result.nssfTier1} deduction />
                <OutputRow label="NSSF Tier II" value={result.nssfTier2} deduction />
                <OutputRow label="SHIF" value={result.shif} deduction />
                <OutputRow label="Housing Levy" value={result.housingLevy} deduction />
                {result.pension > 0 && <OutputRow label={`Pension (${pensionPct}%)`} value={result.pension} deduction />}
                {result.helb > 0 && <OutputRow label="HELB" value={result.helb} deduction />}
                <OutputRow label="Net pay" value={result.netPay} bold />

                <p className="text-[12px] text-ink-400 mt-5 leading-relaxed">
                  Live KRA rates from our Compliance engine (effective {rates.effectiveDate}) — the same rates that run payroll.
                </p>
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
