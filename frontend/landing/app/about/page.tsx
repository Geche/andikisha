import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import StatsBand from "@/components/stats/StatsBand";
import JoinCTA from "@/components/cta/JoinCTA";

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
      "In Kenya, most employees access technology through their phone. The product works on a 2G connection. Offline functionality is not a bonus feature — it is a baseline requirement for this market.",
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
    bio: "10 years building enterprise software in East Africa. Spent 3 years watching businesses get KRA penalties that could have been avoided with better tooling.",
  },
  {
    name: "Amina S.",
    role: "Head of Compliance",
    bio: "Former KRA tax consultant who has filed statutory returns for over 200 Kenyan companies and built the compliance engine at the core of every payroll run.",
  },
  {
    name: "Brian M.",
    role: "Head of Engineering",
    bio: "Previously at a Nairobi fintech processing KES 5B+ in monthly transactions, with the multi-tenant architecture experience to match.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-900 py-24">
        <Container>
          <div className="max-w-[680px]">
            <Eyebrow light className="mb-5">
              Our Story
            </Eyebrow>
            <h1
              className="font-display font-extrabold text-white mb-6"
              style={{
                fontSize: "clamp(2.25rem, 4vw, 3.5rem)",
                lineHeight: "1.05",
                letterSpacing: "-0.015em",
              }}
            >
              Built in Africa, for African businesses.
            </h1>
            <p className="text-[18px] text-white/70 leading-[1.8] max-w-[560px]">
              The team behind AndikishaHR has lived Kenya&apos;s compliance
              challenges firsthand — as HR managers, tax consultants, and
              founders who paid the KRA penalty before they built the tool that
              prevents it.
            </p>
          </div>
        </Container>
      </section>

      <StatsBand />

      {/* Mission */}
      <section className="py-24 bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Eyebrow className="mb-5">Mission</Eyebrow>
              <h2
                className="font-display font-extrabold text-ink-900 mb-6 max-w-[480px]"
                style={{
                  fontSize: "clamp(2.25rem, 4vw, 3.5rem)",
                  lineHeight: "1.05",
                  letterSpacing: "-0.015em",
                }}
              >
                African SMEs deserve the same HR tools as the rest of the world.
              </h2>
              <p className="text-[17px] text-ink-600 leading-relaxed mb-4">
                There are 1.56 million licensed businesses in Kenya. 85% of them
                run payroll on spreadsheets. They are not behind because they
                lack ambition — they are behind because the tools that exist
                were built for London or San Francisco, then reluctantly adapted
                for Nairobi.
              </p>
              <p className="text-[17px] text-ink-600 leading-relaxed">
                AndikishaHR is not an adaptation. It is a product that starts
                with the question: what does a growing Kenyan business actually
                need today?
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { stat: "1.56M", label: "Licensed businesses in Kenya" },
                { stat: "85%", label: "Still running payroll on spreadsheets" },
                { stat: "KES 200K", label: "Monthly error cost for 30 employees" },
                { stat: "25%", label: "Max KRA penalty as % of outstanding tax" },
              ].map((item) => (
                <div
                  key={item.stat}
                  className="bg-surface-alt rounded-xl p-6 border border-ink-200"
                >
                  <p className="font-mono text-[32px] font-medium text-brand-900 mb-2">
                    {item.stat}
                  </p>
                  <p className="text-[14px] text-ink-600 leading-snug">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Values */}
      <section className="py-24 bg-surface-alt">
        <Container>
          <Eyebrow className="mb-4">How We Work</Eyebrow>
          <h2
            className="font-display font-extrabold text-ink-900 mb-14 max-w-[480px]"
            style={{
              fontSize: "clamp(2.25rem, 4vw, 3.5rem)",
              lineHeight: "1.05",
              letterSpacing: "-0.015em",
            }}
          >
            What we believe about building software.
          </h2>
          <div className="divide-y divide-ink-200 border-y border-ink-200">
            {VALUES.map((v) => (
              <div
                key={v.title}
                className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 py-10"
              >
                <p className="font-display font-bold text-[20px] text-ink-900 leading-snug">
                  {v.title}
                </p>
                <p className="text-[16px] text-ink-600 leading-[1.8]">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Team */}
      <section id="team" className="py-24 bg-white">
        <Container>
          <Eyebrow className="mb-4">The Team</Eyebrow>
          <h2
            className="font-display font-extrabold text-ink-900 mb-14 max-w-[480px]"
            style={{
              fontSize: "clamp(2.25rem, 4vw, 3.5rem)",
              lineHeight: "1.05",
              letterSpacing: "-0.015em",
            }}
          >
            People who have done this job before.
          </h2>
          <div className="divide-y divide-ink-200 border-y border-ink-200">
            {TEAM.map((member) => (
              <div
                key={member.name}
                className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr] gap-4 py-8 items-baseline"
              >
                <p className="font-display font-bold text-[18px] text-ink-900">
                  {member.name}
                </p>
                <p className="text-[14px] font-semibold text-brand-700">
                  {member.role}
                </p>
                <p className="text-[15px] text-ink-600 leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Careers */}
      <section id="careers" className="py-24 bg-brand-900">
        <Container>
          <div className="max-w-[600px]">
            <Eyebrow light className="mb-5">
              Careers
            </Eyebrow>
            <h2
              className="font-display font-extrabold text-white mb-6"
              style={{
                fontSize: "clamp(2.25rem, 4vw, 3.5rem)",
                lineHeight: "1.05",
                letterSpacing: "-0.015em",
              }}
            >
              We are hiring people who care about this problem.
            </h2>
            <p className="text-[17px] text-white/70 leading-[1.8] mb-8">
              Engineering, sales, customer success, and compliance roles. Based
              in Nairobi. Remote-friendly within East Africa. If you have worked
              in HR, payroll, or tax in Kenya and want to solve this problem at
              scale, we want to hear from you.
            </p>
            <Link
              href="/contact"
              className="btn-primary btn-lg"
            >
              Send us your CV <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </section>

      <JoinCTA />
    </>
  );
}
