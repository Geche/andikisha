import Container from "@/components/ui/Container";

const BODIES = [
  { abbr: "KRA", name: "Kenya Revenue Authority" },
  { abbr: "NSSF", name: "Natl Social Security Fund" },
  { abbr: "SHA", name: "Social Health Authority" },
  { abbr: "NITA", name: "Natl Industrial Training Auth." },
  { abbr: "HELB", name: "Higher Educ. Loans Board" },
  { abbr: "ODPC", name: "Office of Data Prot. Commissioner" },
];

export default function ComplianceAuthority() {
  return (
    <section className="bg-white py-16 border-b border-ink-100">
      <Container>
        <div className="text-center mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400">
            Built around the rules of
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-ink-100 border border-ink-100 rounded-xl overflow-hidden">
          {BODIES.map(({ abbr, name }) => (
            <div key={abbr} className="bg-white flex flex-col items-center justify-center py-7 px-4 text-center hover:bg-surface-alt transition-colors duration-150">
              <span
                className="font-mono font-bold text-ink-900 block mb-1.5 leading-none"
                style={{ fontSize: "clamp(1.1rem, 1.5vw, 1.25rem)", letterSpacing: "-0.01em" }}
              >
                {abbr}
              </span>
              <span className="text-[11px] text-ink-400 leading-snug">{name}</span>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-ink-400 mt-6 max-w-[500px] mx-auto leading-relaxed">
          AndikishaHR is not affiliated with these institutions. References indicate the statutory frameworks the platform supports.
        </p>
      </Container>
    </section>
  );
}
