"use client";

import { NavRailItem, NavRailGroup, Avatar, cn, useCurrentUser } from "@andikisha/ui";
import {
  Home, Users, CreditCard, Calendar,
  Clock, FileCheck, BarChart2, Building2, Briefcase,
  Settings, LogOut, UserCog,
} from "lucide-react";
import Link from "next/link";
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
        { label: "Employees", href: `${base}/admin/employees`, icon: Users },
        { label: "Payroll",   href: `${base}/admin/payroll`,   icon: CreditCard },
        { label: "Leave",     href: `${base}/admin/leave`,     icon: Calendar },
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
  const currentUser = useCurrentUser();

  // display_name (AUTH-006) with email fallback.
  const name = currentUser?.fullName?.trim() || currentUser?.email || "Account";
  const email = currentUser?.email ?? "";

  return (
    <>
      <NavRailItem
        label="Settings"
        href={`${base}/admin/settings`}
        icon={Settings}
        theme="light"
        active={pathname.startsWith(`${base}/admin/settings`)}
      />

      {/* User chip — the chip itself is the link to My profile; Sign out below. */}
      <div className="mt-1 pt-2 border-t border-neutral-200 space-y-0.5">
        <Link
          href={`${base}/admin/profile`}
          aria-label="My profile"
          className={cn(
            "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors",
            pathname.startsWith(`${base}/admin/profile`)
              ? "bg-neutral-100"
              : "hover:bg-neutral-100"
          )}
        >
          <Avatar name={name} size="sm" />
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-near-black truncate">{name}</p>
            {email && name !== email && (
              <p className="text-[11.5px] text-neutral-500 truncate">{email}</p>
            )}
          </div>
        </Link>
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
      </div>
    </>
  );
}
