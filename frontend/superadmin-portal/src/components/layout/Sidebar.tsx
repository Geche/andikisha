import Link from "next/link";
import {
  SidebarShell,
  type NavItem,
  type NavSection,
} from "@andikisha/ui";
import {
  Home, Building2, CreditCard, Flag, FileSearch, Settings2,
  Activity, ShieldCheck, Briefcase, MessageSquare, Users,
  FileInput, Database, UserCircle, Settings,
} from "lucide-react";
import { LogoutButton } from "./LogoutButton";

const NAV: NavSection[] = [
  {
    items: [
      { label: "Dashboard", href: "/dashboard", icon: Home },
    ],
  },
  {
    label: "Customers",
    items: [
      { label: "Tenants", href: "/tenants", icon: Building2, badge: "—" },
      { label: "Plans & Licences", href: "/plans", icon: CreditCard },
      { label: "Feature Flags", href: "/feature-flags", icon: Flag },
    ],
  },
  {
    label: "Platform",
    items: [
      { label: "Audit Log", href: "/audit", icon: FileSearch },
      { label: "Platform Config", href: "/config", icon: Settings2 },
      { label: "System Health", icon: Activity, locked: true },
      { label: "Security", icon: ShieldCheck, locked: true },
      { label: "Billing & Revenue", icon: Briefcase, locked: true },
      { label: "Communications", icon: MessageSquare, locked: true },
      { label: "Support & Ops", icon: Users, locked: true },
    ],
  },
  {
    label: "Advanced",
    items: [
      { label: "Data Migration", icon: FileInput, locked: true },
      { label: "Backup & DR", icon: Database, locked: true },
    ],
  },
];

export function Sidebar({
  activePath,
  userEmail,
}: {
  activePath: string;
  userEmail: string;
}) {
  return (
    <SidebarShell
      nav={NAV}
      activePath={activePath}
      userEmail={userEmail}
      userRole="Super Admin"
      footerContent={
        <>
          <Link
            href="/profile"
            className="flex items-center gap-2.5 w-full h-[38px] px-2.5 rounded-md text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <UserCircle size={16} strokeWidth={2} className="text-gray-400" />
            Profile
          </Link>
          <Link
            href="/settings"
            className="flex items-center gap-2.5 w-full h-[38px] px-2.5 rounded-md text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Settings size={16} strokeWidth={2} className="text-gray-400" />
            Account settings
          </Link>
          <LogoutButton />
        </>
      }
    />
  );
}
