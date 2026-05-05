import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const PILLARS = [
  {
    number: "01",
    title: "Compliance is a product, not a setting.",
    body: "The compliance engine is its own first-class part of the platform, not a configuration page a developer set up once. The team monitors the KRA legislative cycle, NSSF tribunal decisions, and Cabinet Secretary notices. When rates change, we ship the update on the day it takes effect — not when someone remembers to check the gazette. PAYE bands, NSSF tiers, SHIF, Housing Levy: all maintained as auditable, versioned code.",
  },
  {
    number: "02",
    title: "Built for the phones your team actually owns.",
    body: "Employees open payslips on mid-range Android devices, sometimes on 3G, sometimes offline. The employee portal is a PWA that caches the last payslip locally. Notifications reach employees on SMS and WhatsApp — the platforms they already use for everything else. Login is a six-digit PIN. No password complexity rules. No forgotten credentials. No support tickets asking how to reset a password.",
  },
  {
    number: "03",
    title: "One stack from gross to net to filed.",
    body: "Attendance data flows into the payroll run. Leave balances are already deducted before the run starts. Once the HR manager approves, payslips go out, M-Pesa disbursement is triggered, and statutory returns are queued for filing with KRA, NSSF, and SHIF. No spreadsheet in the middle. No export-import cycle. The loop closes inside one platform, and the audit trail covers every step.",
  },
];

export default function ThreePillars() {
  return (
    <section className="py-24 bg-white">
      <Container>
        <Eyebrow className="mb-12">Why AndikishaHR</Eyebrow>

        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-ink-200">
          {PILLARS.map((pillar) => (
            <div key={pillar.number} className="py-8 lg:py-0 lg:px-10 first:lg:pl-0 last:lg:pr-0">
              <p
                className="font-display font-bold text-brand-700 mb-5 leading-none"
                style={{ fontSize: "clamp(2.5rem, 4vw, 3.5rem)" }}
                aria-hidden
              >
                {pillar.number}
              </p>
              <h3 className="text-[20px] font-semibold text-ink-900 mb-4 leading-snug">
                {pillar.title}
              </h3>
              <p className="text-[16px] text-ink-600 leading-[1.7]">{pillar.body}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
