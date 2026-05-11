"use client";

import { NavRailItem, NavRailGroup, cn } from "@andikisha/ui";
import {
  Home, Building2, CreditCard, Flag, FileSearch, Settings2,
  Activity, ShieldCheck, Briefcase, MessageSquare, Users,
  FileInput, Database, UserCircle, Settings, LogOut,
  type LucideIcon,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";

// ─── Nav definition ───────────────────────────────────────────────────────────

interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  locked?: boolean;
  badge?: string | number;
}

interface NavGroup {
  label?: string;
  spacer?: boolean;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", icon: Home },
    ],
  },
  {
    label: "Customers",
    spacer: true,
    items: [
      { label: "Tenants",        href: "/tenants",       icon: Building2 },
      { label: "Plans & Licences", href: "/licences",   icon: CreditCard },
      { label: "Feature Flags",  href: "/feature-flags", icon: Flag },
    ],
  },
  {
    label: "Platform",
    spacer: true,
    items: [
      { label: "Audit Log",       href: "/audit",   icon: FileSearch },
      { label: "Platform Config", href: "/config",  icon: Settings2 },
      { label: "System Health",   icon: Activity,   locked: true },
      { label: "Security",        icon: ShieldCheck, locked: true },
      { label: "Billing",         icon: Briefcase,  locked: true },
      { label: "Communications",  icon: MessageSquare, locked: true },
      { label: "Support",         icon: Users,      locked: true },
    ],
  },
  {
    label: "Advanced",
    spacer: true,
    items: [
      { label: "Data Migration", icon: FileInput, locked: true },
      { label: "Backup & DR",    icon: Database,  locked: true },
    ],
  },
];

// ─── Nav content ──────────────────────────────────────────────────────────────

export function SuperAdminNav() {
  const pathname = usePathname();
  return (
    <>
      {GROUPS.map((group, gi) => (
        <NavRailGroup
          key={group.label ?? `g-${gi}`}
          label={group.label}
          spacer={group.spacer}
          theme="dark"
        >
          {group.items.map((item) => (
            <NavRailItem
              key={item.label}
              {...item}
              theme="dark"
              active={!!item.href && pathname.startsWith(item.href)}
            />
          ))}
        </NavRailGroup>
      ))}
    </>
  );
}

// ─── Footer content ───────────────────────────────────────────────────────────

export function SuperAdminNavFooter() {
  const pathname = usePathname();
  return (
    <>
      <NavRailItem label="Profile"          href="/profile"   icon={UserCircle} theme="dark" active={pathname === "/profile"} />
      <NavRailItem label="Account settings" href="/settings"  icon={Settings}   theme="dark" active={pathname === "/settings"} />
      <button
        onClick={() => void logout()}
        className={cn(
          "flex items-center gap-2.5 w-full h-9 px-2.5 rounded-lg text-[13.5px] font-medium transition-colors",
          "text-brand-100 hover:bg-brand-900/50 cursor-pointer"
        )}
      >
        <LogOut size={16} strokeWidth={2} className="text-brand-100/70" />
        Sign out
      </button>
    </>
  );
}
