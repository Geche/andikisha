"use client";

import { NavRailItem, NavRailGroup, cn } from "@andikisha/ui";
import {
  Home, Users, CreditCard, Calendar,
  Clock, FileCheck, BarChart2, UserCircle, Settings, LogOut,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";

interface NavGroup {
  label?: string;
  spacer?: boolean;
  items: {
    label: string;
    href?: string;
    icon: React.ElementType;
    locked?: boolean;
  }[];
}

const GROUPS: NavGroup[] = [
  {
    label: "General",
    items: [
      { label: "Dashboard", href: "/admin/dashboard", icon: Home },
    ],
  },
  {
    label: "HR",
    spacer: true,
    items: [
      { label: "Employees", href: "/admin/employees", icon: Users },
      { label: "Payroll",   href: "/admin/payroll",   icon: CreditCard },
      { label: "Leave",     href: "/admin/leave",     icon: Calendar },
    ],
  },
  {
    label: "Operations",
    spacer: true,
    items: [
      { label: "Time & Attendance", href: "/admin/attendance", icon: Clock,     locked: true },
      { label: "Statutory Filings", href: "/admin/compliance", icon: FileCheck, locked: true },
      { label: "Analytics",         href: "/admin/analytics",  icon: BarChart2, locked: true },
    ],
  },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <>
      {GROUPS.map((group, gi) => (
        <NavRailGroup
          key={group.label ?? `g-${gi}`}
          label={group.label}
          spacer={group.spacer}
          theme="light"
        >
          {group.items.map((item) => (
            <NavRailItem
              key={item.label}
              {...item}
              theme="light"
              active={!!item.href && pathname.startsWith(item.href)}
            />
          ))}
        </NavRailGroup>
      ))}
    </>
  );
}

export function AdminNavFooter() {
  const pathname = usePathname();
  return (
    <>
      <NavRailItem label="My profile" href="/my/profile"   icon={UserCircle} theme="light" active={pathname.startsWith("/my/profile")} />
      <NavRailItem label="Settings"   href="/admin/settings" icon={Settings} theme="light" active={pathname.startsWith("/admin/settings")} />
      <button
        onClick={() => void logout()}
        className={cn(
          "flex items-center gap-2.5 w-full h-9 px-2.5 rounded-lg text-[13.5px] font-medium transition-colors",
          "text-neutral-700 hover:bg-neutral-100 cursor-pointer group"
        )}
      >
        <LogOut size={16} strokeWidth={2} className="text-neutral-500 group-hover:text-error" />
        <span className="group-hover:text-error">Sign out</span>
      </button>
    </>
  );
}
