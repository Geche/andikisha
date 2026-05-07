import Container from "@/components/ui/Container";
import Eyebrow from "@/components/ui/Eyebrow";

const BULLETS = [
  {
    title: "Split disbursement in one approval",
    body: "Each employee chooses M-Pesa or bank. You approve once. Both channels execute simultaneously.",
  },
  {
    title: "Real-time delivery confirmation",
    body: "M-Pesa confirms within seconds. Bank transfers tracked to settlement. Full audit trail per employee.",
  },
];

const BATCHES = [
  { label: "M-Pesa — 34 employees",    amount: "KES 2,190,000", pct: 45,  processing: true  },
  { label: "Equity Bank — 9 employees", amount: "KES 1,204,800", pct: 100, processing: false },
  { label: "KCB Bank — 5 employees",    amount: "KES 1,417,600", pct: 100, processing: false },
];

export default function FeatureDisbursement() {
  return (
    <section className="bg-surface-alt py-[88px]">
      <Container>
        <div
          className="grid items-center"
          style={{ gridTemplateColumns: "6fr 5fr", gap: "72px" }}
        >
          {/* Dark card (left) */}
          <div className="bg-brand-900 border border-brand-800 rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between px-5 py-4 bg-white/[0.04] border-b border-white/[0.08]">
              <span className="text-[13px] font-bold text-white">November batch disbursement</span>
              <span className="text-[11px] font-bold bg-brand-500/20 text-brand-500 px-2.5 py-1 rounded-full">
                Approved
              </span>
            </div>
            <div className="p-5 flex flex-col gap-1">
              {BATCHES.map(({ label, amount, pct, processing }) => (
                <div key={label} className="py-3 border-b border-white/[0.07] last:border-0">
                  <div className="flex justify-between mb-2">
                    <span className="text-[12px] text-white/60 font-medium">{label}</span>
                    <span className="font-mono text-[13px] font-bold text-white">{amount}</span>
                  </div>
                  <div className="h-[5px] bg-white/10 rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full rounded-full transition-all ${processing ? "bg-amber" : "bg-brand-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-end">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${processing ? "bg-amber/20 text-amber" : "bg-brand-500/20 text-brand-500"}`}>
                      {processing ? "Processing" : "Sent"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Text (right) */}
          <div>
            <Eyebrow className="mb-4">Disbursement</Eyebrow>
            <h2
              className="font-display font-black text-ink-900 leading-[1.06] tracking-[-0.02em] mb-4"
              style={{ fontSize: "clamp(28px, 3.2vw, 42px)" }}
            >
              One pay run. M-Pesa and bank, together.
            </h2>
            <p className="text-[17px] text-ink-600 leading-[1.7] max-w-[440px] mb-8">
              Native Daraja API integration. Direct file integration with Equity, KCB, Co-op, NCBA,
              Stanbic and DTB. No re-keying, no second platform.
            </p>
            <div className="flex flex-col gap-6">
              {BULLETS.map(({ title, body }) => (
                <div key={title}>
                  <p className="flex items-center gap-2 text-[15px] font-bold text-ink-900 mb-1.5">
                    <span className="w-[7px] h-[7px] rounded-full bg-brand-900 shrink-0" aria-hidden />
                    {title}
                  </p>
                  <p className="text-[14px] text-ink-600 leading-[1.65] pl-[15px]">{body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
