import Container from "@/components/ui/Container";

export interface Stat {
  num: string;
  suffix: string;
  label: string;
}

export const DEFAULT_STATS: Stat[] = [
  { num: "240", suffix: "+", label: "Businesses on the platform" },
  { num: "1.2", suffix: "B", label: "KES processed monthly" },
  { num: "100", suffix: "%", label: "On-time statutory filings" },
  { num: "<20", suffix: "m", label: "Average payroll run" },
];

export default function StatsBand({ stats = DEFAULT_STATS }: { stats?: Stat[] }) {
  return (
    <section className="bg-white border-t border-ink-100 border-b border-ink-100 py-16">
      <Container>
        {/* Layout assumes exactly 4 stats — grid-cols-4 is intentional */}
        <div className="grid grid-cols-4 max-w-[900px] mx-auto">
          {stats.map(({ num, suffix, label }, i) => (
            <div
              key={label}
              className={`text-center px-6 ${i < stats.length - 1 ? "border-r border-ink-100" : ""}`}
            >
              <p
                className="font-black text-ink-900 leading-none tracking-[-0.03em] mb-2.5"
                style={{ fontSize: "clamp(40px, 4vw, 54px)" }}
              >
                {num}<span className="text-amber">{suffix}</span>
              </p>
              <p className="text-[14px] text-ink-600 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
