import { TESTIMONIALS } from "@/lib/data";
import AnimatedSection from "@/components/ui/AnimatedSection";

function Stars() {
  return (
    <div className="flex gap-0.5 text-amber text-sm mb-4" aria-label="5 stars">
      {[...Array(5)].map((_, i) => (
        <span key={i} aria-hidden="true">★</span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-24 bg-surface-alt">
      <div className="max-w-[1320px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-14">
          <AnimatedSection>
            <p className="section-eyebrow">What People Say</p>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <h2 className="section-title mx-auto max-w-[480px]">
              HR managers in Kenya trust this.
            </h2>
          </AnimatedSection>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {TESTIMONIALS.map((t, i) => (
            <AnimatedSection
              key={t.name}
              delay={([0, 100, 200] as const)[i]}
            >
              <figure className="card flex flex-col gap-5 h-full">
                <Stars />

                <blockquote className="text-[16px] text-neutral-700 leading-[1.8] italic flex-1">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <figcaption className="flex items-center gap-3 mt-auto">
                  {/* Avatar */}
                  <div className="w-11 h-11 rounded-full bg-brand-900 flex items-center justify-center font-display font-extrabold text-[15px] text-amber shrink-0">
                    {t.initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-[15px] text-neutral-900 truncate">
                      {t.name}
                    </p>
                    <p className="text-[13px] text-neutral-600 truncate">
                      {t.role} &middot; {t.company}
                    </p>
                  </div>

                  <span className="text-[11px] font-semibold px-2 py-1 bg-brand-50 text-brand-700 rounded shrink-0">
                    {t.employees}
                  </span>
                </figcaption>
              </figure>
            </AnimatedSection>
          ))}
        </div>

        {/* Rating bar */}
        <AnimatedSection>
          <div className="flex justify-center">
            <div className="flex items-center gap-3 bg-white border border-neutral-200 rounded-xl px-5 py-3 text-[14px] text-neutral-600">
              <span className="text-amber text-base" aria-hidden="true">★★★★★</span>
              <strong className="text-neutral-900">4.8/5</strong>
              from 200+ reviews on G2 and Capterra
            </div>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
}
