import Container from "@/components/ui/Container";

const BADGES = [
  { label: "KRA iTax-ready", mono: null },
  { label: "NSSF Tier I & II", mono: "6%" },
  { label: "SHIF", mono: "2.75%" },
  { label: "Housing Levy", mono: "1.5%" },
  { label: "NITA & HELB", mono: null },
  { label: "Data hosted in Kenya", mono: null },
];

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden className="shrink-0">
      <circle cx="7" cy="7" r="7" fill="#0b3d2e" />
      <path d="M4 7L6.2 9.2L10 5" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function SocialProofStrip() {
  return (
    <section className="bg-white border-b border-ink-100 py-6">
      <Container>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-400 shrink-0 whitespace-nowrap">
            Built around the rules of
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {BADGES.map(({ label, mono }) => (
              <div key={label} className="flex items-center gap-2">
                <CheckIcon />
                <span className="text-[13px] font-medium text-ink-700">
                  {label}
                  {mono && (
                    <span className="font-mono text-brand-700 ml-1">{mono}</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
