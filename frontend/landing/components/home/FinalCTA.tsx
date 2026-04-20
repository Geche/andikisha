import Link from "next/link";
import { COMPANY } from "@/lib/data";
import AnimatedSection from "@/components/ui/AnimatedSection";

export default function FinalCTA() {
  return (
    <section className="bg-brand-950 py-24 relative overflow-hidden">
      {/* Dual ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(232,160,32,0.1)_0%,transparent_65%)] translate-x-[-50%] translate-y-[-30%]" />
        <div className="absolute bottom-0 right-[20%] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(39,168,112,0.1)_0%,transparent_65%)] translate-x-[50%] translate-y-[30%]" />
      </div>

      <div className="max-w-[1320px] mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-[680px] mx-auto text-center">
          <AnimatedSection>
            <p className="section-eyebrow-white mb-5">Get Started</p>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <h2 className="font-display text-[42px] md:text-[52px] font-extrabold text-white mb-5 leading-[1.1]">
              Your next payroll run should take{" "}
              <span className="text-amber">30 minutes.</span>
            </h2>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <p className="text-[18px] text-white/65 mb-10 leading-[1.75]">
              Join 500+ Kenyan businesses that have already stopped worrying
              about compliance.
            </p>
          </AnimatedSection>

          <AnimatedSection delay={300}>
            <div className="flex flex-wrap justify-center gap-3 mb-7">
              <Link href="/pricing" className="btn-primary btn-lg">
                Start Free — No Credit Card
              </Link>
              <Link href="/demo" className="btn-outline-white btn-lg">
                Request a Live Demo
              </Link>
            </div>

            <a
              href={COMPANY.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-white/55 text-[14px] font-medium hover:text-brand-500 transition-colors duration-200"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Questions? Chat with us on WhatsApp
            </a>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
}
