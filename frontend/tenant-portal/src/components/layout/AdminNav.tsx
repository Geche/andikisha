"use client";

import { NavRailItem, NavRailGroup, cn, useCurrentUser } from "@andikisha/ui";
import {
  Home, Users, CreditCard, Calendar,
  Clock, FileCheck, BarChart2, UserCircle, Settings, LogOut, UserCog,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@/hooks/useWorkspace";
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

export function AdminNav() {
  const pathname = usePathname();
  const workspace = useWorkspace();
  const base = `/${workspace}`;

  // User management is gated to roles the backend also authorises for /api/v1/auth/users
  // (hasAnyRole ADMIN, HR_MANAGER). Default-deny: hidden until roles confirm the grant.
  const currentUser = useCurrentUser();
  const canManageUsers = (currentUser?.roles ?? []).some((r) => r === "ADMIN" || r === "HR_MANAGER");

  const GROUPS: NavGroup[] = [
    {
      label: "General",
      items: [
        { label: "Dashboard", href: `${base}/admin/dashboard`, icon: Home },
      ],
    },
    {
      label: "HR",
      spacer: true,
      items: [
        { label: "Employees", href: `${base}/admin/employees`, icon: Users },
        { label: "Payroll",   href: `${base}/admin/payroll`,   icon: CreditCard },
        { label: "Leave",     href: `${base}/admin/leave`,     icon: Calendar },
      ],
    },
    {
      label: "Operations",
      spacer: true,
      items: [
        { label: "Time & Attendance", href: `${base}/admin/attendance`, icon: Clock,     locked: true },
        { label: "Statutory Filings", href: `${base}/admin/compliance`, icon: FileCheck, locked: true },
        { label: "Analytics",         href: `${base}/admin/analytics`,  icon: BarChart2, locked: true },
      ],
    },
    ...(canManageUsers
      ? [{
          label: "Administration",
          spacer: true,
          items: [
            { label: "User management", href: `${base}/admin/users`, icon: UserCog },
          ],
        }]
      : []),
  ];

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
  const workspace = useWorkspace();
  const base = `/${workspace}`;

  return (
    <>
      <NavRailItem label="My profile" href={`${base}/my/profile`}     icon={UserCircle} theme="light" active={pathname.startsWith(`${base}/my/profile`)} />
      <NavRailItem label="Settings"   href={`${base}/admin/settings`} icon={Settings}   theme="light" active={pathname.startsWith(`${base}/admin/settings`)} />
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
