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

const COLOR: Record<NonNullable<UserRole>, string> = {
  SUPER_ADMIN:     "bg-brand-900 text-white",
  ADMIN:           "bg-brand-100 text-brand-800",
  HR_MANAGER:      "bg-amber-light text-[#92600A]",
  HR_OFFICER:      "bg-brand-50 text-brand-700",
  PAYROLL_OFFICER: "bg-[#E0F2FE] text-[#0369A1]",
  LINE_MANAGER:    "bg-[#F3E8FF] text-[#6B21A8]",
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
