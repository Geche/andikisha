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
    spacer: true,
    items: [
      { label: "Tenants",          href: "/tenants",       icon: Building2 },
      { label: "Plans & Licences", href: "/licences",      icon: CreditCard },
      { label: "Feature Flags",    href: "/feature-flags", icon: Flag },
    ],
  },
  {
    spacer: true,
    items: [
      { label: "Audit Log",       href: "/audit",  icon: FileSearch },
      { label: "Platform Config", href: "/config", icon: Settings2 },
      { label: "System Health",   icon: Activity,      locked: true },
      { label: "Security",        icon: ShieldCheck,   locked: true },
      { label: "Billing",         icon: Briefcase,     locked: true },
      { label: "Communications",  icon: MessageSquare, locked: true },
      { label: "Support",         icon: Users,         locked: true },
    ],
  },
  {
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
          theme="light"
        >
          {group.items.map((item) => (
            <NavRailItem
              key={item.label}
              {...item}
              theme="light"
              active={!!item.href && (pathname.startsWith(item.href) || (item.href === "/dashboard" && pathname === "/shell-preview"))}
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
      <NavRailItem label="Profile"          href="/profile"   icon={UserCircle} theme="light" active={pathname === "/profile"} />
      <NavRailItem label="Account settings" href="/settings"  icon={Settings}   theme="light" active={pathname === "/settings"} />
      <button
        onClick={() => void logout()}
        className={cn(
          "flex items-center gap-2 w-full h-9 px-2 rounded-md text-[14px] font-semibold transition-colors",
          "text-[#404040] hover:bg-[#FAFAFA] cursor-pointer hover:text-[#B91C1C]"
        )}
      >
        <LogOut size={20} strokeWidth={1.75} className="text-[#737373]" />
        Sign out
      </button>
    </>
  );
}
