import { Check, X } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

type ComparisonValue = boolean | string;

const ROWS: Array<[string, ComparisonValue, ComparisonValue]> = [
  ["PAYE brackets maintained for you", false, true],
  ["NSSF & SHIF calculations", false, true],
  ["Housing Levy calculated automatically", false, true],
  ["M-Pesa salary disbursement", false, true],
  ["Audit trail & version history", false, true],
  ["Employee self-service payslips", false, true],
  ["Payroll run time", "3–5 hours", "< 20 minutes"],
];

export default function PricingComparisonTable() {
  return (
    <section className="py-20 bg-surface-alt border-b border-ink-200">
      <Container>
        <div className="text-center mb-12">
          <Eyebrow className="mb-4">Why switch</Eyebrow>
          <h2
            className="font-display font-bold text-ink-900 max-w-[480px] mx-auto"
            style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: "1.1", letterSpacing: "-0.02em" }}
          >
            AndikishaHR vs running payroll on a spreadsheet
          </h2>
        </div>
        <div className="max-w-[700px] mx-auto overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-ink-200">
                <th scope="col" className="text-left py-3 pr-6 font-semibold text-ink-400 w-[45%]">Capability</th>
                <th scope="col" className="text-center py-3 px-4 font-semibold text-ink-400 w-[27%]">Spreadsheet</th>
                <th scope="col" className="text-center py-3 px-4 font-bold text-brand-900 w-[27%]">AndikishaHR</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map(([cap, spreadsheet, andikisha]) => (
                <tr key={cap} className="border-b border-ink-100 last:border-0">
                  <td className="py-3.5 pr-6 text-ink-700 font-medium">{cap}</td>
                  <td className="py-3.5 px-4 text-center">
                    {typeof spreadsheet === "boolean" ? (
                      spreadsheet ? (
                        <Check size={16} className="text-brand-500 mx-auto" aria-label="Yes" />
                      ) : (
                        <X size={16} className="text-danger mx-auto" aria-label="No" />
                      )
                    ) : (
                      <span className="text-ink-400">{spreadsheet}</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {typeof andikisha === "boolean" ? (
                      andikisha ? (
                        <Check size={16} className="text-brand-500 mx-auto" aria-label="Yes" />
                      ) : (
                        <X size={16} className="text-danger mx-auto" aria-label="No" />
                      )
                    ) : (
                      <span className="text-brand-700 font-semibold">{andikisha}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}
