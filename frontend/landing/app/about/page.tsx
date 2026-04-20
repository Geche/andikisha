import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "@/components/ui/AnimatedSection";

export const metadata: Metadata = {
  title: "About",
  description:
    "AndikishaHR is built in Nairobi by a team that has lived Kenya's compliance challenges firsthand. Learn our story, mission, and values.",
};

const VALUES = [
  {
    title: "Local depth over global breadth",
    description:
      "We chose to build Kenya's compliance engine properly before expanding to Uganda or Tanzania. Getting PAYE, NSSF, SHIF, and Housing Levy exactly right matters more than being in five countries with shallow compliance.",
  },
  {
    title: "Mobile-first is not optional",
    description:
      "In Kenya, most employees access technology through their phone. The product works perfectly on a 2G connection. Offline functionality is not a bonus feature — it is a baseline requirement for this market.",
  },
  {
    title: "Honesty about limitations",
    description:
      "When a feature is not ready, we say so. When the law is ambiguous, we tell you. We would rather lose a sale than oversell a capability we have not built yet.",
  },
  {
    title: "Production standards from day one",
    description:
      "There are no 'we will fix this later' decisions in the codebase. The architecture, security model, and compliance logic were designed for 10,000 tenants even when the first customer signed up.",
  },
];

const TEAM = [
  {
    name: "Lawrence K.",
    role: "Founder & CEO",
    bio: "10 years building enterprise software in East Africa. Spent 3 years watching businesses get KRA penalties that could have been avoided with better tooling. That frustration became AndikishaHR.",
    initials: "LK",
  },
  {
    name: "Amina S.",
    role: "Head of Compliance",
    bio: "Former KRA tax consultant. Has filed statutory returns for over 200 Kenyan companies. She built the compliance engine that sits at the core of every payroll run.",
    initials: "AS",
  },
  {
    name: "Brian M.",
    role: "Head of Engineering",
    bio: "Previously at a Nairobi fintech processing KES 5B+ in monthly transactions. Designed AndikishaHR's multi-tenant architecture to handle enterprise-scale payroll from day one.",
    initials: "BM",
  },
  {
    name: "Fatuma H.",
    role: "Head of Customer Success",
    bio: "HR Manager for 8 years at a 200-person Kenyan company. She understands the exact pain points our customers face because she lived them. Every onboarding process reflects that.",
    initials: "FH",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-hero-gradient py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(39,168,112,0.12)_0%,transparent_65%)] pointer-events-none" />
        <div className="max-w-[1320px] mx-auto px-6 md:px-12 relative z-10">
          <div className="max-w-[720px]">
            <AnimatedSection>
              <p className="section-eyebrow-white">Our Story</p>
            </AnimatedSection>
            <AnimatedSection delay={100}>
              <h1 className="font-display text-[46px] md:text-[58px] font-extrabold text-white mb-7 leading-[1.08]">
                Built by people who got the KRA penalty first.
              </h1>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <p className="text-[18px] text-white/70 leading-[1.8] max-w-[580px]">
                AndikishaHR started because the founder ran payroll manually for
                a 60-person company, got a PAYE penalty, and looked for a tool
                that was actually built for Kenya. He did not find one. So he
                built it.
              </p>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-white">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <AnimatedSection>
              <p className="section-eyebrow">Mission</p>
              <h2 className="section-title max-w-[480px]">
                African SMEs deserve the same HR tools as the rest of the world.
              </h2>
              <p className="section-sub mb-6">
                There are 1.56 million licensed businesses in Kenya. 85% of them
                run payroll on spreadsheets. They are not behind because they
                lack ambition — they are behind because the tools that exist
                were built for London or San Francisco, then reluctantly adapted
                for Nairobi.
              </p>
              <p className="text-[17px] text-neutral-600 leading-relaxed">
                AndikishaHR is not an adaptation. It is a product that starts
                with the question: what does a growing Kenyan business actually
                need today? The answer to that question drives every feature,
                every pricing decision, and every line of code.
              </p>
            </AnimatedSection>

            {/* Stats block */}
            <AnimatedSection delay={100}>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { stat: "1.56M", label: "Licensed businesses in Kenya" },
                  { stat: "85%", label: "Still running payroll on spreadsheets" },
                  { stat: "KES 200K", label: "Monthly error cost for 30 employees" },
                  { stat: "25%", label: "Max KRA penalty as % of outstanding tax" },
                ].map((item) => (
                  <div key={item.stat} className="bg-surface-alt rounded-xl p-6 border border-neutral-200">
                    <p className="font-mono text-[32px] font-medium text-brand-900 mb-2">
                      {item.stat}
                    </p>
                    <p className="text-[14px] text-neutral-600 leading-snug">
                      {item.label}
                    </p>
                  </div>
                ))}
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 bg-surface-alt">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12">
          <div className="text-center mb-14">
            <AnimatedSection>
              <p className="section-eyebrow">How We Work</p>
            </AnimatedSection>
            <AnimatedSection delay={100}>
              <h2 className="section-title mx-auto max-w-[480px]">
                What we believe about building software
              </h2>
            </AnimatedSection>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {VALUES.map((v, i) => (
              <AnimatedSection key={v.title} delay={([0, 100, 0, 100] as const)[i]}>
                <div className="card h-full">
                  <h3 className="font-display font-bold text-[20px] text-neutral-900 mb-3">
                    {v.title}
                  </h3>
                  <p className="text-[15px] text-neutral-600 leading-[1.75]">
                    {v.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="py-24 bg-white">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12">
          <div className="text-center mb-14">
            <AnimatedSection>
              <p className="section-eyebrow">The Team</p>
            </AnimatedSection>
            <AnimatedSection delay={100}>
              <h2 className="section-title mx-auto max-w-[480px]">
                People who have done this job before.
              </h2>
            </AnimatedSection>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <AnimatedSection key={member.name} delay={([0, 100, 200, 300] as const)[i]}>
                <div className="card text-center flex flex-col items-center h-full">
                  <div className="w-16 h-16 rounded-full bg-brand-900 flex items-center justify-center font-display font-extrabold text-[22px] text-amber mb-4">
                    {member.initials}
                  </div>
                  <h3 className="font-display font-bold text-[18px] text-neutral-900 mb-1">
                    {member.name}
                  </h3>
                  <p className="text-[13px] text-brand-700 font-semibold mb-3">
                    {member.role}
                  </p>
                  <p className="text-[14px] text-neutral-600 leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* Hiring section */}
      <section id="careers" className="py-20 bg-brand-900 text-white">
        <div className="max-w-[1320px] mx-auto px-6 md:px-12 text-center">
          <AnimatedSection>
            <p className="section-eyebrow-white mb-4">Careers</p>
            <h2 className="font-display text-[38px] font-extrabold text-white max-w-[480px] mx-auto mb-5">
              We are hiring people who care about this problem.
            </h2>
            <p className="text-[17px] text-white/65 max-w-[480px] mx-auto mb-8">
              Engineering, sales, customer success, and compliance roles.
              Based in Nairobi. Remote-friendly within East Africa.
            </p>
            <Link
              href="/contact"
              className="btn-primary btn-lg inline-flex items-center gap-2"
            >
              Send us your CV <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </AnimatedSection>
        </div>
      </section>
    </>
  );
}
