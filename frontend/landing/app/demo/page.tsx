import type { Metadata } from "next";
import DemoForm from "./DemoForm";
import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";
import { CheckCircle, Clock, FileText, HelpCircle, TrendingUp } from "lucide-react";
import LogosRow from "@/components/logos/LogosRow";
import JoinCTA from "@/components/cta/JoinCTA";

export const metadata: Metadata = {
  title: "Request a Demo",
  description:
    "See AndikishaHR in action. Request a personalised 30-minute demo with our team and get your first payroll run set up.",
};

const DEMO_BULLETS = [
  {
    icon: <CheckCircle size={18} aria-hidden="true" />,
    text: "Live payroll run for a company similar to yours — same industry, same headcount",
  },
  {
    icon: <FileText size={18} aria-hidden="true" />,
    text: "PAYE, NSSF, SHIF, and Housing Levy calculated in real time so you can verify the numbers",
  },
  {
    icon: <HelpCircle size={18} aria-hidden="true" />,
    text: "Open Q&A on your specific compliance situation — bring your questions",
  },
  {
    icon: <TrendingUp size={18} aria-hidden="true" />,
    text: "A concrete migration plan if you are moving from a spreadsheet or existing system",
  },
];

export default function DemoPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-brand-900 py-20">
        <Container className="text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 text-white/75 text-[13px] font-medium mb-5">
            <CheckCircle size={13} className="text-amber" aria-hidden="true" />
            240+ companies onboarded across Kenya
          </div>
          <Eyebrow light className="mb-4">
            Live Demo
          </Eyebrow>
          <h1 className="font-display text-[clamp(36px,5vw,56px)] font-extrabold text-white max-w-[640px] mx-auto mb-5 leading-[1.1]">
            See AndikishaHR in 30 minutes.
          </h1>
          <p className="text-[18px] text-white/70 max-w-[500px] mx-auto">
            A personalised session with our team. We walk through your specific
            payroll and compliance setup — not a generic slide deck.
          </p>
        </Container>
      </section>

      <LogosRow />

      {/* Two-column: left = form, right = what to expect */}
      <section className="py-20 bg-surface-alt">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Left — Demo form */}
            <div className="bg-white rounded-2xl border border-ink-200 p-8 shadow-[0_8px_40px_rgba(11,61,46,0.08)]">
              <h2 className="font-display font-bold text-[24px] text-ink-900 mb-2">
                Book your session
              </h2>
              <p className="text-[14px] text-ink-600 mb-7">
                We typically respond within 2 hours on business days with
                calendar options.
              </p>
              <DemoForm />
            </div>

            {/* Right — What to expect */}
            <div>
              <h2 className="font-display font-bold text-[32px] text-ink-900 mb-4">
                What happens in the demo
              </h2>
              <p className="text-[16px] text-ink-600 leading-relaxed mb-8">
                We run a live payroll for a sample company similar to yours. You
                see exactly how the platform handles your situation — not a
                polished demo environment with fake data.
              </p>

              <ul className="flex flex-col gap-5 mb-10">
                {DEMO_BULLETS.map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-brand-700 mt-0.5 shrink-0">
                      {item.icon}
                    </span>
                    <span className="text-[15px] text-ink-700 leading-relaxed">
                      {item.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Reassurance card */}
              <div className="bg-brand-900 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Clock size={16} className="text-amber" aria-hidden="true" />
                  <p className="font-display font-bold text-[18px]">
                    Already running payroll?
                  </p>
                </div>
                <p className="text-[14px] text-white/70 leading-relaxed mb-4">
                  Bring your last payroll run or a sample spreadsheet to the
                  session. We will show you the exact migration path and
                  calculate your projected time savings on the spot.
                </p>
                <p className="text-[13px] text-brand-500 font-medium">
                  No obligation. No sales pressure.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <JoinCTA />
    </>
  );
}
