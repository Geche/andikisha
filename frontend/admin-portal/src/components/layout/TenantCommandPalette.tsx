"use client";
import { useRouter } from "next/navigation";
import { CommandPalette } from "@andikisha/ui";
import { LayoutDashboard, Users, CreditCard, Calendar, Plus } from "lucide-react";

export function TenantCommandPalette() {
  const router = useRouter();
  return (
    <CommandPalette
      placeholder="Search actions, employees, pages…"
      groups={[
        {
          label: "Navigation",
          items: [
            {
              id: "nav-dashboard",
              label: "Dashboard",
              icon: LayoutDashboard,
              onSelect: () => router.push("/dashboard"),
              keywords: ["home"],
            },
            {
              id: "nav-employees",
              label: "Employees",
              icon: Users,
              onSelect: () => router.push("/employees"),
              keywords: ["people", "staff"],
            },
            {
              id: "nav-payroll",
              label: "Payroll",
              icon: CreditCard,
              onSelect: () => router.push("/payroll"),
              keywords: ["pay", "salary"],
            },
            {
              id: "nav-leave",
              label: "Leave",
              icon: Calendar,
              onSelect: () => router.push("/leave"),
              keywords: ["absence", "holiday"],
            },
          ],
        },
        {
          label: "Actions",
          items: [
            {
              id: "action-new-employee",
              label: "Add new employee",
              icon: Plus,
              onSelect: () => router.push("/employees/new"),
              keywords: ["add", "hire", "new"],
            },
            {
              id: "action-run-payroll",
              label: "Run payroll",
              icon: Plus,
              onSelect: () => router.push("/payroll/new"),
              keywords: ["run", "pay"],
            },
          ],
        },
      ]}
    />
  );
}
