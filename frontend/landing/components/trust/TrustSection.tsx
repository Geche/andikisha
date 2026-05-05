import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const CHECKLIST: { item: string; status: string }[] = [
  { item: "KDPA registered", status: "Yes" },
  { item: "GDPR-aligned data handling", status: "Yes" },
  { item: "SOC 2 Type 1", status: "In audit" },
  { item: "ISO 27001", status: "In roadmap" },
  { item: "Encryption at rest", status: "AES-256" },
  { item: "Encryption in transit", status: "TLS 1.3" },
  { item: "Audit log retention", status: "7 years" },
  { item: "Data residency", status: "Configurable" },
];

export default function TrustSection() {
  return (
    <section className="bg-brand-950 py-24">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left */}
          <div>
            <Eyebrow light className="mb-6">Security & compliance</Eyebrow>
            <h2
              className="font-display font-bold text-white mb-6"
              style={{ fontSize: "clamp(2.25rem, 4vw, 3.5rem)", lineHeight: "1.05", letterSpacing: "-0.015em" }}
            >
              Built to enterprise standard.
            </h2>
            <p className="text-[17px] text-brand-100/70 leading-[1.7] mb-4">
              Payroll data is some of the most sensitive data a business holds. Every employee&apos;s salary, every statutory deduction, every bank account number lives inside this platform. We treat that responsibility seriously, and the architecture reflects it.
            </p>
            <p className="text-[17px] text-brand-100/70 leading-[1.7]">
              Tenant isolation is enforced at the PostgreSQL schema level — your data is never co&shy;mingled with another company&apos;s records, even at the infrastructure layer. Audit logs are immutable and retained for seven years, matching the KRA requirement for payroll records. Every API call is authenticated, every data change is logged with the acting user&apos;s identity.
            </p>
          </div>

          {/* Right — checklist */}
          <div className="flex flex-col justify-center">
            <div className="flex flex-col gap-0 divide-y divide-white/[0.07]">
              {CHECKLIST.map(({ item, status }) => (
                <div key={item} className="flex items-center justify-between py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-[6px] h-[6px] rounded-full bg-brand-500 shrink-0" aria-hidden />
                    <span className="text-[15px] text-white">{item}</span>
                  </div>
                  <span
                    className={`font-mono text-[13px] ${
                      status === "Yes"
                        ? "text-brand-500 font-semibold"
                        : "text-brand-100"
                    }`}
                    style={{ fontFeatureSettings: '"tnum" 1' }}
                  >
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
