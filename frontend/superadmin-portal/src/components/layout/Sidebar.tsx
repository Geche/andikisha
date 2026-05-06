import type { ElementType } from "react";
import Link from "next/link";
import { LogoFull } from "@andikisha/ui";
import {
  Home, Building2, CreditCard, Flag, FileSearch, Settings2,
  Activity, ShieldCheck, Briefcase, MessageSquare, Users,
  FileInput, Database, Settings, LifeBuoy, ExternalLink,
} from "lucide-react";

interface NavItem {
  label: string;
  href?: string;
  icon: ElementType;
  badge?: string | number;
  locked?: boolean;
}

interface NavSection {
  label?: string;
  items: NavItem[];
}

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

function NavItemRow({
  item,
  active,
}: {
  item: NavItem;
  active: boolean;
}) {
  const Icon = item.icon;

  const inner = (
    <span
      className={[
        "flex items-center gap-2.5 w-full h-[38px] px-2.5 rounded-md text-sm font-medium transition-colors",
        item.locked
          ? "opacity-45 cursor-default text-gray-400"
          : active
          ? "bg-[#E8F5F0] text-[#0B3D2E] font-semibold border-l-2 border-[#E8A020] pl-[9px]"
          : "text-gray-500 hover:bg-gray-50 hover:text-gray-900 cursor-pointer",
      ].join(" ")}
    >
      <Icon
        size={16}
        className={active ? "text-[#0B3D2E]" : "text-gray-400"}
        strokeWidth={2}
      />
      <span className="flex-1">{item.label}</span>
      {item.locked && (
        <span className="text-[9.5px] font-bold bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded-full tracking-wide">
          Soon
        </span>
      )}
      {item.badge !== undefined && !item.locked && (
        <span className="text-[11px] font-bold bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </span>
  );

  if (item.locked || !item.href) return <div>{inner}</div>;
  return <Link href={item.href}>{inner}</Link>;
}

export function Sidebar({ activePath }: { activePath: string }) {
  return (
    <aside className="w-[280px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <LogoFull className="h-[26px] w-auto" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {NAV.map((section, si) => (
          <div key={section.label ?? `root-${si}`}>
            {section.label && (
              <p className="text-[10.5px] font-bold text-[#166A50] uppercase tracking-[0.09em] px-2 pt-4 pb-1.5">
                {section.label}
              </p>
            )}
            {section.items.map((item) => (
              <NavItemRow
                key={item.label}
                item={item}
                active={!!item.href && activePath.startsWith(item.href)}
              />
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 px-3 py-3 space-y-0.5">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 w-full h-[38px] px-2.5 rounded-md text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900"
        >
          <Settings size={16} strokeWidth={2} className="text-gray-400" />
          Settings
        </Link>
        <div className="flex items-center gap-2.5 w-full h-[38px] px-2.5 rounded-md text-sm text-gray-500 hover:bg-gray-50 cursor-pointer">
          <LifeBuoy size={16} strokeWidth={2} className="text-gray-400" />
          <span className="flex-1">Support</span>
          <span className="flex items-center gap-1 text-[11px] font-semibold text-[#27A870]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#27A870]" />
            Online
          </span>
        </div>
        {process.env.NEXT_PUBLIC_API_URL && (
          <a
            href={process.env.NEXT_PUBLIC_API_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 w-full h-[38px] px-2.5 rounded-md text-sm text-gray-500 hover:bg-gray-50"
          >
            <ExternalLink size={16} strokeWidth={2} className="text-gray-400" />
            <span className="flex-1">Open in browser</span>
            <ExternalLink size={12} className="text-gray-300" />
          </a>
        )}
      </div>
    </aside>
  );
}
