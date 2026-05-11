import Link from "next/link";
import { cn } from "../utils";
import { LogoFull } from "./LogoFull";
import { OfflineBadge } from "./OfflineBadge";
import type { ReactNode, ElementType } from "react";

// ─── MobileBottomNav ──────────────────────────────────────────────────────────

export interface BottomNavItem {
  label: string;
  href: string;
  icon: ElementType;
  active?: boolean;
}

interface MobileBottomNavProps {
  items: BottomNavItem[];
}

function MobileBottomNav({ items }: MobileBottomNavProps) {
  return (
    <nav
      className="flex-shrink-0 flex items-stretch bg-surface border-t border-[#E5E7EB] lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors",
              item.active ? "text-brand-700" : "text-[#6B7280]"
            )}
          >
            <Icon
              size={22}
              strokeWidth={item.active ? 2.25 : 1.75}
              className={item.active ? "text-brand-700" : "text-[#9CA3AF]"}
            />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

// ─── EmployeeShell ────────────────────────────────────────────────────────────

interface EmployeeShellProps {
  /** Bottom nav items for mobile */
  bottomNav: BottomNavItem[];
  /** Desktop left rail nav (NavRailGroup/NavRailItem) */
  desktopNav?: ReactNode;
  /** Desktop left rail footer */
  desktopNavFooter?: ReactNode;
  /** Top bar right slot (language toggle, notifications) */
  topRight?: ReactNode;
  /** Greeting or tenant label for top bar center */
  topCenter?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Employee shell — mobile-first PWA layout.
 * Mobile: top bar (48px) + content + bottom nav (64px).
 * Desktop (lg+): top bar (56px) + left rail (200px) + content.
 */
export function EmployeeShell({
  bottomNav,
  desktopNav,
  desktopNavFooter,
  topRight,
  topCenter,
  children,
  className,
}: EmployeeShellProps) {
  return (
    <div className={cn("flex flex-col h-screen overflow-hidden bg-surface lg:flex-row", className)}>
      {/* Desktop left rail — hidden on mobile */}
      {desktopNav && (
        <aside className="hidden lg:flex flex-col w-[200px] flex-shrink-0 h-full bg-surface border-r border-[#E5E7EB]">
          <div className="h-[56px] flex items-center px-4 flex-shrink-0 border-b border-[#E5E7EB]">
            <LogoFull className="h-[22px] w-auto" />
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
            {desktopNav}
          </nav>
          {desktopNavFooter && (
            <div className="flex-shrink-0 border-t border-[#E5E7EB] px-3 py-3 space-y-0.5">
              {desktopNavFooter}
            </div>
          )}
        </aside>
      )}

      {/* Main column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 flex items-center justify-between px-4 bg-surface border-b border-[#E5E7EB] h-12 lg:h-[56px]">
          {/* Mobile: logo */}
          <div className="lg:hidden">
            <LogoFull className="h-[20px] w-auto" />
          </div>
          {/* Desktop: center content if provided */}
          {topCenter && (
            <div className="hidden lg:flex flex-1 justify-center">
              {topCenter}
            </div>
          )}
          <div className="flex items-center gap-2 ml-auto">
            <OfflineBadge />
            {topRight}
          </div>
        </header>

        {/* Scrollable page content */}
        <main className="flex-1 overflow-y-auto bg-surface">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <MobileBottomNav items={bottomNav} />
      </div>
    </div>
  );
}
