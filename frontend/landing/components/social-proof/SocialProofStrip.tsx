// TODO: Replace placeholder logos with real customer logos when available

const COMPANIES = [
  {
    name: "Sokoni Group",
    initials: "SG",
    color: "#1a4a2e",
  },
  {
    name: "Mara Holdings",
    initials: "MH",
    color: "#2d3748",
  },
  {
    name: "Tatu Foods",
    initials: "TF",
    color: "#1a365d",
  },
  {
    name: "Barabara Logistics",
    initials: "BL",
    color: "#2c3e50",
  },
  {
    name: "Serengeti Partners",
    initials: "SP",
    color: "#3d2b1f",
  },
];

function CompanyMark({ name, initials, color }: { name: string; initials: string; color: string }) {
  return (
    <div className="flex items-center gap-2.5 opacity-50 hover:opacity-70 transition-opacity duration-200" title={name}>
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden>
        <rect width="32" height="32" rx="6" fill={color} />
        <text
          x="16"
          y="21"
          textAnchor="middle"
          fontFamily="Montserrat, sans-serif"
          fontWeight="700"
          fontSize="12"
          fill="white"
          letterSpacing="-0.5"
        >
          {initials}
        </text>
      </svg>
      <span className="text-[14px] font-semibold text-ink-700 whitespace-nowrap">{name}</span>
    </div>
  );
}

export default function SocialProofStrip() {
  return (
    <section className="bg-white border-b border-ink-200 py-8">
      <div className="mx-auto max-w-[1320px] px-6 md:px-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-10">
          <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-ink-400 shrink-0">
            Built for businesses like these
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            {COMPANIES.map((c) => (
              <CompanyMark key={c.name} {...c} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
