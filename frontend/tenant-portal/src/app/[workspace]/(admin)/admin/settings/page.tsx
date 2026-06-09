"use client";

import Link from "next/link";
import { Building2, Briefcase, ShieldCheck, ChevronRight } from "lucide-react";
import { PageHeader } from "@andikisha/ui";
import { useWorkspace } from "@/hooks/useWorkspace";

const SECTIONS = [
  {
    href: "departments",
    label: "Departments",
    description: "Group employees and structure payroll reports.",
    icon: Building2,
  },
  {
    href: "positions",
    label: "Positions",
    description: "Job titles and grade levels used across employee records.",
    icon: Briefcase,
  },
  {
    href: "roles",
    label: "Roles & permissions",
    description: "Who can see and do what across the workspace.",
    icon: ShieldCheck,
  },
];

export default function SettingsPage() {
  const workspace = useWorkspace();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Settings" subtitle="Manage your workspace structure and access." />
      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
          {SECTIONS.map((s) => (
            <Link
              key={s.href}
              href={`/${workspace}/admin/settings/${s.href}`}
              className="group flex items-start gap-4 rounded-xl border border-neutral-200 bg-white p-5 hover:border-brand-600 hover:shadow-sm transition-all"
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center">
                <s.icon className="w-5 h-5 text-brand-700" aria-hidden="true" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-[14px] font-semibold text-near-black">{s.label}</p>
                  <ChevronRight className="w-4 h-4 text-neutral-300 group-hover:text-brand-600 transition-colors" aria-hidden="true" />
                </div>
                <p className="text-[13px] text-neutral-500 leading-snug mt-1">{s.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
