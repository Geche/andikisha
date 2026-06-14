"use client";

import { Clock3, Plug, Receipt, Bell, ScrollText } from "lucide-react";
import { PageHeader } from "@andikisha/ui";

// Workspace structure (departments, positions) and Access (users & roles) moved to
// their own sidebar groups in R3-1. Settings is now the home for tenant configuration.
// These surfaces are not built yet — shown as coming-soon so the category reads honestly
// (see docs/decisions/2026-06-14-run-03-ia-reorganization.md).
const UPCOMING = [
  { label: "Organisation profile", description: "Timezone, fiscal year, currency display.", icon: Clock3 },
  { label: "Statutory defaults", description: "Default leave allocation, pay frequency, working days per month.", icon: ScrollText },
  { label: "Notifications", description: "Which events email your team, and who receives them.", icon: Bell },
  { label: "Integrations", description: "M-Pesa, KRA iTax, and SMS provider connections.", icon: Plug },
  { label: "Billing", description: "Your plan, invoices, and payment method.", icon: Receipt },
];

export default function SettingsPage() {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Settings" subtitle="Configure how your organisation runs on Andikisha." />
      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
          {UPCOMING.map((s) => (
            <div
              key={s.label}
              className="flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-5 opacity-60"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-neutral-400" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] font-semibold text-near-black">{s.label}</p>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full flex-shrink-0">
                    Coming soon
                  </span>
                </div>
                <p className="text-[13px] text-neutral-500 leading-snug mt-1">{s.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
