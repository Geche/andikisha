"use client";

import { NavRailItem, NavRailGroup, useCurrentUser } from "@andikisha/ui";
import {
  Home, Users, CreditCard, Calendar,
  Clock, FileCheck, BarChart2, Building2, Briefcase,
  Settings, UserCog, ScrollText,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@/hooks/useWorkspace";
import { SidebarUserChip } from "./SidebarUserChip";

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

  // "Access" (user/role management) is gated to the roles the backend also authorises
  // for /api/v1/auth/users (hasAnyRole ADMIN, HR_MANAGER). Default-deny: hidden until
  // roles confirm the grant. Per-item gating for the other groups stays coarse
  // (backend enforces) — tracked as AUTHZ-BACKLOG-001.
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
        { label: "Employees",    href: `${base}/admin/employees`,    icon: Users },
        { label: "Payroll",      href: `${base}/admin/payroll`,      icon: CreditCard },
        { label: "Leave",        href: `${base}/admin/leave`,        icon: Calendar },
        { label: "Certificates", href: `${base}/admin/certificates`, icon: ScrollText },
      ],
    },
    {
      label: "Operations",
      spacer: true,
      items: [
        { label: "Time & attendance", href: `${base}/admin/attendance`, icon: Clock,     locked: true },
        { label: "Statutory filings", href: `${base}/admin/compliance`, icon: FileCheck, locked: true },
        { label: "Analytics",         href: `${base}/admin/analytics`,  icon: BarChart2, locked: true },
      ],
    },
    {
      label: "Workspace",
      spacer: true,
      items: [
        { label: "Departments", href: `${base}/admin/settings/departments`, icon: Building2 },
        { label: "Positions",   href: `${base}/admin/settings/positions`,   icon: Briefcase },
      ],
    },
    ...(canManageUsers
      ? [{
          label: "Access",
          spacer: true,
          items: [
            { label: "Users & roles", href: `${base}/admin/users`, icon: UserCog },
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
      <NavRailItem
        label="Settings"
        href={`${base}/admin/settings`}
        icon={Settings}
        theme="light"
        active={pathname.startsWith(`${base}/admin/settings`)}
      />

      {/* Profile → /admin/profile + Sign out, flush with the rest of the footer (no divider). */}
      <SidebarUserChip profileHref={`${base}/admin/profile`} />
    </>
  );
}
