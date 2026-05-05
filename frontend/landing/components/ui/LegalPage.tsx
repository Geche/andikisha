import Container from "@/components/ui/Container";

interface Section {
  title: string;
  body: string;
}

interface LegalPageProps {
  title: string;
  subtitle?: string;
  lastUpdated: string;
  sections: Section[];
}

export default function LegalPage({ title, subtitle, lastUpdated, sections }: LegalPageProps) {
  return (
    <>
      <section className="bg-brand-900 py-16">
        <Container>
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-amber mb-4">Legal</p>
          <h1
            className="font-display font-bold text-white mb-3"
            style={{ fontSize: "clamp(2rem, 4vw, 3rem)", letterSpacing: "-0.02em", lineHeight: "1.1" }}
          >
            {title}
          </h1>
          {subtitle && <p className="text-[16px] text-brand-100/70 max-w-[560px]">{subtitle}</p>}
          <p className="text-[13px] text-white/30 mt-4">Last updated: {lastUpdated}</p>
        </Container>
      </section>

      <section className="py-16 bg-white">
        <Container>
          <div className="max-w-[720px]">
            {sections.map((s) => (
              <div key={s.title} className="mb-10 pb-10 border-b border-ink-200 last:border-0 last:mb-0 last:pb-0">
                <h2 className="font-display font-semibold text-[20px] text-ink-900 mb-3 leading-snug">
                  {s.title}
                </h2>
                <p className="text-[16px] text-ink-600 leading-[1.75]">{s.body}</p>
              </div>
            ))}

            <div className="mt-12 pt-8 border-t border-ink-200">
              <p className="text-[14px] text-ink-500">
                Questions about this document?{" "}
                <a href="/contact" className="text-brand-700 underline underline-offset-2 hover:text-brand-900 transition-colors">
                  Contact us
                </a>
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
