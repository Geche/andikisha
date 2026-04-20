"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { FEATURES_TABS } from "@/lib/data";
import AnimatedSection from "@/components/ui/AnimatedSection";

type BadgeColor = "green" | "amber" | "blue";

function MockupBadge({
  text,
  color,
}: {
  text: string;
  color: BadgeColor;
}) {
  const cls: Record<BadgeColor, string> = {
    green: "badge-green",
    amber: "badge-amber",
    blue: "badge-blue",
  };
  return <span className={cls[color]}>{text}</span>;
}

const ICONS: Record<string, React.ReactNode> = {
  payroll: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
    </svg>
  ),
  people: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  employee: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  ),
};

export default function FeaturesSection() {
  const [activeTab, setActiveTab] = useState(FEATURES_TABS[0].id);

  const active = FEATURES_TABS.find((t) => t.id === activeTab)!;

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-[1320px] mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="text-center mb-12">
          <AnimatedSection>
            <p className="section-eyebrow">Product Capabilities</p>
          </AnimatedSection>
          <AnimatedSection delay={100}>
            <h2 className="section-title mx-auto max-w-[640px]">
              Everything your HR team needs. Nothing they do not.
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <p className="section-sub mx-auto max-w-[520px]">
              Three integrated modules that cover the full employee lifecycle —
              from first payslip to final settlement.
            </p>
          </AnimatedSection>
        </div>

        {/* Tab pills */}
        <div className="flex justify-center gap-2 mb-12 flex-wrap">
          {FEATURES_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-2.5 rounded-full text-[14px] font-semibold transition-all duration-200 font-body",
                activeTab === tab.id
                  ? "bg-brand-900 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-brand-50 hover:text-brand-900"
              )}
            >
              {ICONS[tab.id]}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Feature list */}
          <div className="flex flex-col gap-3">
            {active.items.map((item, i) => (
              <div
                key={item.title}
                className="flex items-start gap-3.5 p-4 rounded-xl hover:bg-brand-50 transition-colors duration-200 cursor-default"
                style={{
                  animationDelay: `${i * 60}ms`,
                }}
              >
                <div className="w-9 h-9 rounded-lg bg-amber-light flex items-center justify-center text-amber-dark shrink-0">
                  {ICONS[activeTab]}
                </div>
                <div>
                  <p className="font-display font-bold text-[16px] text-neutral-900 mb-1">
                    {item.title}
                  </p>
                  <p className="text-[14px] text-neutral-600 leading-[1.65]">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Mockup */}
          <div className="bg-brand-950 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-[-40px] right-[-40px] w-[200px] h-[200px] bg-[radial-gradient(circle,rgba(232,160,32,0.15)_0%,transparent_70%)] pointer-events-none" />

            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-white/40 font-display mb-4">
              {active.mockupTitle}
            </p>

            <div className="relative z-10">
              {active.mockupRows.map((row, i) => (
                <div key={i} className="mockup-row">
                  <span className="mockup-label">{row.label}</span>
                  {row.badge ? (
                    <MockupBadge
                      text={row.badge}
                      color={row.badgeColor as BadgeColor}
                    />
                  ) : (
                    <span className="mockup-value">{row.value}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
