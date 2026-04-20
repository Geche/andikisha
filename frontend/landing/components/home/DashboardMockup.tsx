"use client";

import { useEffect, useRef } from "react";

const COMPLIANCE_ITEMS = [
  { label: "PAYE", value: "KES 428,500" },
  { label: "NSSF", value: "KES 82,320" },
  { label: "SHIF", value: "KES 64,800" },
  { label: "Housing Levy", value: "KES 97,200" },
];

export default function DashboardMockup() {
  const cardsRef = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      setTimeout(() => {
        card.style.opacity = "1";
        card.style.transform = "translateX(0)";
      }, 400 + i * 180);
    });
  }, []);

  return (
    <div className="mockup-shell">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
        <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/45 font-display">
          March 2026 Payroll
        </span>
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-500">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
          Filed with KRA
        </div>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3">
        {/* Card 1 — Gross pay */}
        <div
          ref={(el) => { if (el) cardsRef.current[0] = el; }}
          className="bg-white/[0.06] border border-white/10 rounded-xl p-4"
          style={{
            opacity: 0,
            transform: "translateX(20px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <p className="text-[11px] text-white/45 font-medium uppercase tracking-[0.06em] mb-2 font-body">
            Total Gross Pay
          </p>
          <p className="font-mono text-[24px] font-medium text-white mb-1">
            KES 3,240,000
          </p>
          <div className="flex items-center gap-2 text-[12px] text-white/50">
            <span>47 employees</span>
            <span className="text-brand-500 font-semibold">
              ↑ 3 new this month
            </span>
          </div>
        </div>

        {/* Card 2 — Compliance */}
        <div
          ref={(el) => { if (el) cardsRef.current[1] = el; }}
          className="bg-white/[0.06] border border-white/10 rounded-xl p-4"
          style={{
            opacity: 0,
            transform: "translateX(20px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <p className="text-[11px] text-white/45 font-medium uppercase tracking-[0.06em] mb-3 font-body">
            Statutory Compliance
          </p>
          <div className="flex flex-col gap-2">
            {COMPLIANCE_ITEMS.map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2.5 text-[12px] text-white/65"
              >
                <div className="w-4 h-4 rounded-full bg-brand-500 flex items-center justify-center shrink-0">
                  <svg
                    viewBox="0 0 8 8"
                    fill="none"
                    width="8"
                    height="8"
                    aria-hidden="true"
                  >
                    <polyline
                      points="1,4 3,6 7,2"
                      stroke="white"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <span className="font-medium">{item.label}</span>
                <span className="ml-auto font-mono text-white/80">
                  {item.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3 — Leave */}
        <div
          ref={(el) => { if (el) cardsRef.current[2] = el; }}
          className="bg-white/[0.06] border border-white/10 rounded-xl p-4"
          style={{
            opacity: 0,
            transform: "translateX(20px)",
            transition: "opacity 0.5s ease, transform 0.5s ease",
          }}
        >
          <p className="text-[11px] text-white/45 font-medium uppercase tracking-[0.06em] mb-2 font-body">
            Leave Approvals
          </p>
          <p className="font-mono text-[24px] font-medium text-white mb-1">
            3
          </p>
          <p className="text-[12px] text-amber font-semibold">
            Pending your review
          </p>
        </div>
      </div>
    </div>
  );
}
