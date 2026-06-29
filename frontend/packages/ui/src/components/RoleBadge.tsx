import { cn } from "../utils";
import type { UserRole } from "../lib/useCurrentRole";

const LABEL: Record<NonNullable<UserRole>, string> = {
  SUPER_ADMIN:     "Super Admin",
  ADMIN:           "Admin",
  HR_MANAGER:      "HR Manager",
  HR_OFFICER:      "HR Officer",
  PAYROLL_OFFICER: "Payroll Officer",
  LINE_MANAGER:    "Line Manager",
  EMPLOYEE:        "Employee",
};

// On-brand role palette: brand (green) ramp, amber ramp, neutral, and semantic
// green only. No blue/purple (brand rule) and no hardcoded hex (frontend/CLAUDE.md).
const COLOR: Record<NonNullable<UserRole>, string> = {
  SUPER_ADMIN:     "bg-brand-900 text-white",
  ADMIN:           "bg-brand-100 text-brand-800",
  HR_MANAGER:      "bg-amber-light text-amber-text",
  HR_OFFICER:      "bg-brand-50 text-brand-700",
  PAYROLL_OFFICER: "bg-amber-50 text-amber-700",
  LINE_MANAGER:    "bg-success-bg text-success",
  EMPLOYEE:        "bg-neutral-100 text-neutral-700",
};

interface RoleBadgeProps {
  role: UserRole;
  className?: string;
}

export function RoleBadge({ role, className }: RoleBadgeProps) {
  if (!role) return null;
  return (
    <span className={cn("inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold", COLOR[role], className)}>
      {LABEL[role]}
    </span>
  );
}
