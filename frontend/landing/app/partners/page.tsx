import type { Metadata } from "next";
import Link from "next/link";
import { Calculator, Users, Wrench, Percent, Megaphone, Zap, Headphones, ArrowRight } from "lucide-react";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

export const metadata: Metadata = {
  title: "Partners — AndikishaHR",
  description:
    "Join the AndikishaHR partner programme. Revenue share, co-marketing, and early compliance feature access for accountants, HR consultants, and payroll bureaus.",
};

const PARTNER_TYPES = [
  {
    icon: <Calculator size={24} aria-hidden="true" />,
    title: "Accountants & Payroll Bureaus",
    description: "CPA firms and payroll bureaus managing statutory compliance for multiple Kenyan clients.",
    qualifies: ["Handle payroll for 3+ client companies", "File PAYE, NSSF, or SHIF on behalf of clients", "Based in Kenya or East Africa"],
  },
  {
    icon: <Users size={24} aria-hidden="true" />,
    title: "HR Consultancies",
    description: "HR advisory firms helping Kenyan SMEs build people operations from the ground up.",
    qualifies: ["Advise on HR policy and systems", "Implement or recommend HR software to clients", "Work with growing SMEs (10–500 employees)"],
  },
  {
    icon: <Wrench size={24} aria-hidden="true" />,
    title: "Implementation Partners",
    description: "Technology consultants and ERP integrators who set up business software for East African companies.",
    qualifies: ["Implement ERP or business software", "Serve clients who need payroll integration", "Technical capability to configure or integrate APIs"],
  },
];

const BENEFITS = [
  {
    icon: <Percent size={20} aria-hidden="true" />,
    title: "Revenue share",
    description: "Earn a percentage of first-year ARR for every client you refer that converts to a paid plan.",
  },
  {
    icon: <Megaphone size={20} aria-hidden="true" />,
    title: "Co-marketing",
    description: "Joint case studies, co-branded materials, and a listing in our partner directory on andikishahr.com.",
  },
  {
    icon: <Zap size={20} aria-hidden="true" />,
    title: "Early access",
    description: "Beta access to new compliance features before general release — test before your clients see it.",
  },
  {
    icon: <Headphones size={20} aria-hidden="true" />,
    title: "Dedicated support",
    description: "A named account lead and priority SLA for support tickets raised on behalf of your clients.",
  },
];

const STEPS = [
  {
    num: "01",
    title: "Apply",
    description: "Fill in the contact form with subject line \"Partner enquiry\". Tell us about your firm and the clients you serve.",
  },
  {
    num: "02",
    title: "Discovery call",
    description: "30-minute call with our partnerships team to confirm fit, discuss your client base, and walk through the programme terms.",
  },
  {
    num: "03",
    title: "Onboard",
    description: "Partner agreement signed, portal access granted, first co-marketing asset briefed. You're live within a week.",
  },
];

export default function PartnersPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-900 py-28">
        <Container>
          <div className="max-w-[680px]">
            <Eyebrow light className="mb-5">Partner Programme</Eyebrow>
            <h1
              className="font-display font-bold text-white mb-6 leading-[1.03]"
              style={{ fontSize: "clamp(2.5rem, 5vw, 4rem)", letterSpacing: "-0.025em" }}
            >
              Build a practice around the future of HR in East Africa.
            </h1>
            <p className="text-[18px] text-brand-100/70 leading-[1.7] max-w-[520px] mb-10">
              We work with accountants, HR consultants, and payroll bureaus who serve Kenyan SMEs.
              Partners get revenue share, co-marketing, and early compliance feature access.
            </p>
            <Link
              href="/contact?subject=partner"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-lg bg-amber hover:bg-amber-dark text-ink-900 font-bold text-[15px] transition-colors duration-200 focus-ring"
            >
              Enquire about partnering <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </Container>
      </section>

      {/* Who qualifies */}
      <section className="py-24 bg-white">
        <Container>
          <div className="text-center mb-14">
            <Eyebrow className="mb-4">Who qualifies</Eyebrow>
            <h2
              className="font-display font-bold text-ink-900 max-w-[520px] mx-auto"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: "1.1", letterSpacing: "-0.02em" }}
            >
              Three types of partners we work with.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PARTNER_TYPES.map(({ icon, title, description, qualifies }) => (
              <div key={title} className="bg-surface-alt border border-ink-200 rounded-2xl p-7">
                <div className="w-11 h-11 rounded-xl bg-brand-50 flex items-center justify-center text-brand-700 mb-5">
                  {icon}
                </div>
                <h3 className="font-display font-bold text-[18px] text-ink-900 mb-3">{title}</h3>
                <p className="text-[14px] text-ink-600 leading-relaxed mb-5">{description}</p>
                <p className="text-[12px] font-bold uppercase tracking-wider text-ink-400 mb-3">You qualify if you…</p>
                <ul className="flex flex-col gap-2">
                  {qualifies.map((q) => (
                    <li key={q} className="flex items-start gap-2 text-[13px] text-ink-700">
                      <div className="w-[5px] h-[5px] rounded-full bg-amber mt-1.5 shrink-0" aria-hidden="true" />
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* What you get */}
      <section className="py-24 bg-surface-alt border-y border-ink-200">
        <Container>
          <div className="text-center mb-14">
            <Eyebrow className="mb-4">Benefits</Eyebrow>
            <h2
              className="font-display font-bold text-ink-900 max-w-[480px] mx-auto"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: "1.1", letterSpacing: "-0.02em" }}
            >
              What partners get.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-[800px] mx-auto">
            {BENEFITS.map(({ icon, title, description }) => (
              <div key={title} className="bg-white border border-ink-200 rounded-2xl p-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center text-brand-700 shrink-0">
                    {icon}
                  </div>
                  <h3 className="font-display font-bold text-[17px] text-ink-900">{title}</h3>
                </div>
                <p className="text-[14px] text-ink-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* How it works */}
      <section className="py-24 bg-white">
        <Container>
          <div className="text-center mb-14">
            <Eyebrow className="mb-4">Process</Eyebrow>
            <h2
              className="font-display font-bold text-ink-900 max-w-[400px] mx-auto"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: "1.1", letterSpacing: "-0.02em" }}
            >
              How to join.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-[900px] mx-auto">
            {STEPS.map(({ num, title, description }) => (
              <div key={num}>
                <p className="font-mono text-[36px] font-bold text-brand-100 mb-3">{num}</p>
                <h3 className="font-display font-bold text-[20px] text-ink-900 mb-3">{title}</h3>
                <p className="text-[15px] text-ink-600 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Apply CTA */}
      <section className="bg-brand-900 py-20">
        <Container>
          <div className="max-w-[600px]">
            <Eyebrow light className="mb-5">Apply now</Eyebrow>
            <h2
              className="font-display font-bold text-white mb-5"
              style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", lineHeight: "1.1", letterSpacing: "-0.02em" }}
            >
              Programme is invite-only while we onboard our first 50 customers.
            </h2>
            <p className="text-[16px] text-brand-100/65 leading-[1.7] mb-8">
              We are designing the programme with our early partners. If you serve Kenyan SMEs and
              want to add AndikishaHR to your offering, get in touch now.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/contact?subject=partner"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-amber hover:bg-amber-dark text-ink-900 font-bold text-[14px] transition-colors duration-200 focus-ring"
              >
                Enquire via contact form <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <a
                href="mailto:partners@andikishahr.com"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-white/20 text-white/80 hover:bg-white/10 font-medium text-[14px] transition-colors duration-200 focus-ring"
              >
                partners@andikishahr.com
              </a>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
