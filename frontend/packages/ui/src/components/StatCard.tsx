import type { ReactNode } from "react";
import { cn } from "../utils";

interface StatCardProps {
  label: string;
  value: ReactNode;
  change?: string;
  positive?: boolean;
  sub?: string;
  className?: string;
}

export function StatCard({ label, value, change, positive, sub, className }: StatCardProps) {
  return (
    <div className={cn("bg-surface border border-neutral-200 rounded-xl p-5", className)}>
      <p className="text-[12px] font-semibold uppercase tracking-wide text-neutral-500 mb-2">{label}</p>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[28px] font-bold text-near-black leading-none">{value}</p>
        {change != null && (
          <span
            className={cn(
              "inline-flex items-center gap-1 text-[12px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5",
              positive ? "bg-brand-100 text-brand-800" : "bg-red-100 text-red-700"
            )}
          >
            {change}
          </span>
        )}
      </div>
      {sub && <p className="text-[12px] text-neutral-400 mt-1.5">{sub}</p>}
    </div>
  );
}
