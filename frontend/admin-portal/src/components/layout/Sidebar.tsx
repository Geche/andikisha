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
      { label: "Dashboard", href: "/dashboard", icon: Home },
    ],
  },
  {
    label: "HR",
    spacer: true,
    items: [
      { label: "Employees", href: "/employees", icon: Users },
      { label: "Payroll",   href: "/payroll",   icon: CreditCard },
      { label: "Leave",     href: "/leave",     icon: Calendar },
    ],
  },
  {
    label: "Operations",
    spacer: true,
    items: [
      { label: "Time & Attendance", href: "/attendance", icon: Clock,     locked: true },
      { label: "Statutory Filings", href: "/compliance", icon: FileCheck, locked: true },
      { label: "Analytics",         href: "/analytics",  icon: BarChart2, locked: true },
    ],
  },
];

export function TenantAdminNav() {
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

export function TenantAdminNavFooter() {
  const pathname = usePathname();
  return (
    <>
      <NavRailItem label="My profile" href="/profile"  icon={UserCircle} theme="light" active={pathname === "/profile"} />
      <NavRailItem label="Settings"   href="/settings" icon={Settings}   theme="light" active={pathname === "/settings"} />
      <button
        onClick={() => void logout()}
        className={cn(
          "flex items-center gap-2.5 w-full h-9 px-2.5 rounded-lg text-[13.5px] font-medium transition-colors",
          "text-[#374151] hover:bg-[#F3F4F6] cursor-pointer group"
        )}
      >
        <LogOut size={16} strokeWidth={2} className="text-[#6B7280] group-hover:text-error" />
        <span className="group-hover:text-error">Sign out</span>
      </button>
    </>
  );
}
