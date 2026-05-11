import { cn } from "../utils";

export type BadgeStatus =
  | "active" | "approved" | "paid" | "disbursed" | "filed"
  | "pending" | "draft" | "calculating" | "trial"
  | "rejected" | "failed" | "cancelled" | "terminated" | "suspended"
  | "inactive";

const STATUS_CLASSES: Record<BadgeStatus, string> = {
  active:      "bg-brand-100 text-brand-800",
  approved:    "bg-brand-100 text-brand-800",
  paid:        "bg-brand-100 text-brand-800",
  disbursed:   "bg-brand-100 text-brand-800",
  filed:       "bg-brand-100 text-brand-800",
  pending:     "bg-amber-light text-[#92600A]",
  draft:       "bg-[#F3F4F6] text-[#4B5563]",
  calculating: "bg-amber-light text-[#92600A]",
  trial:       "bg-amber-light text-[#92600A]",
  rejected:    "bg-red-100 text-red-700",
  failed:      "bg-red-100 text-red-700",
  cancelled:   "bg-[#F3F4F6] text-[#6B7280]",
  terminated:  "bg-[#F3F4F6] text-[#6B7280]",
  suspended:   "bg-[#F3F4F6] text-[#6B7280]",
  inactive:    "bg-[#F3F4F6] text-[#6B7280]",
};

interface BadgeProps {
  status?: BadgeStatus;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ status, className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold",
        status ? STATUS_CLASSES[status] : "bg-[#F3F4F6] text-[#374151]",
        className
      )}
    >
      {children}
    </span>
  );
}
