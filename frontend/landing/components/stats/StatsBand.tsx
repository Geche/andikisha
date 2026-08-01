import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import CountUp from "@/components/ui/CountUp";

export interface Stat {
  num: string;
  suffix: string;
  label: string;
}

// Honest, day-one capability metrics — verifiable product truths, not
// traction claims. Every value is a fact about what the software does.
export const DEFAULT_STATS: Stat[] = [
  { num: "100", suffix: "%", label: "Statutory deductions automated" },
  { num: "<20", suffix: "m", label: "Minutes to run payroll" },
  { num: "2",   suffix: "",  label: "Payout rails in one batch" },
  { num: "0",   suffix: "",  label: "Manual tax calculations" },
];

export default function StatsBand({ stats = DEFAULT_STATS }: { stats?: Stat[] }) {
  return (
    <section className="bg-white border-t border-ink-100 border-b border-ink-100 py-16">
      <Container>
        {/* Layout assumes exactly 4 stats — grid-cols-4 is intentional */}
        <div className="grid grid-cols-4 max-w-[900px] mx-auto">
          {stats.map(({ num, suffix, label }, i) => (
            <Reveal
              key={label}
              delay={i * 80}
              className={`text-center px-6 ${i < stats.length - 1 ? "border-r border-ink-100" : ""}`}
            >
              <p
                className="font-black text-ink-900 leading-none tracking-[-0.03em] mb-2.5"
                style={{ fontSize: "clamp(40px, 4vw, 54px)" }}
              >
                <CountUp value={num} /><span className="text-amber">{suffix}</span>
              </p>
              <p className="text-[14px] text-ink-600 font-medium">{label}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
