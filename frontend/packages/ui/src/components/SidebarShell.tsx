"use client";

import type { ElementType, ReactNode } from "react";
import Link from "next/link";
import { LogoFull } from "./LogoFull";

export interface NavItem {
  label: string;
  href?: string;
  icon: ElementType;
  badge?: string | number;
  locked?: boolean;
}

export interface NavSection {
  label?: string;
  items: NavItem[];
}

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
        "flex items-center gap-2.5 w-full h-[36px] px-2.5 rounded-md text-[13.5px] font-medium transition-colors",
        item.locked
          ? "opacity-40 cursor-default text-gray-400"
          : active
          ? "bg-gray-100 text-gray-900 font-semibold"
          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 cursor-pointer",
      ].join(" ")}
    >
      <Icon
        size={16}
        className={active ? "text-gray-700" : "text-gray-400"}
        strokeWidth={active ? 2.25 : 2}
      />
      <span className="flex-1">{item.label}</span>
      {item.locked && (
        <span className="text-[10px] font-semibold text-gray-400 tracking-wide">
          Soon
        </span>
      )}
      {item.badge !== undefined && !item.locked && (
        <span className="text-[11px] font-semibold bg-gray-100 text-gray-600 min-w-[20px] text-center px-1.5 py-0.5 rounded-full">
          {item.badge}
        </span>
      )}
    </span>
  );

  if (item.locked || !item.href) return <div>{inner}</div>;
  return <Link href={item.href}>{inner}</Link>;
}

function UserAvatar({ email }: { email: string }) {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]/);
  const initials =
    parts.length >= 2
      ? (parts[0][0] ?? "") + (parts[1][0] ?? "")
      : local.slice(0, 2);
  return (
    <div className="w-8 h-8 rounded-full bg-[#0B3D2E] text-white flex items-center justify-center text-[11px] font-bold flex-shrink-0 uppercase">
      {initials || "SA"}
    </div>
  );
}

interface SidebarShellProps {
  nav: NavSection[];
  activePath: string;
  userEmail: string;
  userRole: string;
  footerContent?: ReactNode;
}

export function SidebarShell({
  nav,
  activePath,
  userEmail,
  userRole,
  footerContent,
}: SidebarShellProps) {
  return (
    <aside className="w-[280px] flex-shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b border-gray-100">
        <LogoFull className="h-[26px] w-auto" />
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-3">
        {nav.map((section, si) => (
          <div key={section.label ?? `root-${si}`}>
            {section.label && (
              <p className="text-[10.5px] font-semibold text-gray-400 uppercase tracking-[0.1em] px-2.5 pt-5 pb-1">
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

      {/* Footer actions (profile, settings, logout) */}
      {footerContent && (
        <div className="border-t border-gray-100 px-3 pt-2 pb-2 space-y-0.5">
          {footerContent}
        </div>
      )}

      {/* User card */}
      <div className="px-3 pb-4 pt-2 border-t border-gray-100">
        <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-gray-50 transition-colors cursor-default">
          <UserAvatar email={userEmail} />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-semibold text-gray-900 truncate leading-tight">
              {userRole}
            </p>
            <p className="text-[11.5px] text-gray-400 truncate leading-tight">{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
