import { Landmark, ShieldCheck, HeartPulse, Home, Smartphone } from "lucide-react";

// The statutory obligations and payout rail the product handles natively.
// An honest trust strip — capability, not customer endorsement.
const STANDARDS = [
  { icon: Landmark,    label: "PAYE · KRA" },
  { icon: ShieldCheck, label: "NSSF" },
  { icon: HeartPulse,  label: "SHIF" },
  { icon: Home,        label: "Housing Levy" },
  { icon: Smartphone,  label: "M-Pesa payouts" },
];

export default function LogosRow() {
  return (
    <section className="bg-white border-t border-ink-100 border-b border-ink-100 py-9">
      <p className="text-[13px] text-ink-400 text-center mb-7 font-medium">
        Built for Kenyan statutory compliance
      </p>
      <div className="flex items-center justify-center gap-x-10 gap-y-4 flex-wrap px-6">
        {STANDARDS.map(({ icon: Icon, label }) => (
          <div key={label} className="flex items-center gap-2 text-ink-600">
            <Icon size={18} strokeWidth={2} className="text-brand-700 shrink-0" aria-hidden />
            <span className="text-[14px] font-semibold tracking-[-0.01em]">{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
