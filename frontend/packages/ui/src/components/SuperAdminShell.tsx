import { cn } from "../utils";
import { TopBar } from "./TopBar";
import { LogoFull } from "./LogoFull";
import type { ReactNode } from "react";

interface SuperAdminShellProps {
  /** Sidebar nav content (NavRailGroup + NavRailItem children) */
  nav: ReactNode;
  /** Footer content inside the nav rail (profile, settings, logout) */
  navFooter?: ReactNode;
  /** Top-bar right slot (ProfileMenu, notifications, etc.) */
  topRight?: ReactNode;
  /** Shown when impersonating a tenant — triggers amber top-bar border */
  impersonationBanner?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * SuperAdmin shell — dark forest-green left rail (#071E13), light top bar.
 * Used by superadmin-portal.
 */
export function SuperAdminShell({
  nav,
  navFooter,
  topRight,
  impersonationBanner,
  children,
  className,
}: SuperAdminShellProps) {
  const impersonating = !!impersonationBanner;
  return (
    <div className={cn("flex h-screen overflow-hidden bg-surface-alt", className)}>
      {/* Left rail — dark green */}
      <aside className="w-[240px] flex-shrink-0 flex flex-col h-full bg-brand-950 border-r border-brand-900">
        {/* Logo area */}
        <div className="h-[56px] flex items-center px-4 flex-shrink-0 border-b border-brand-900">
          <LogoFull variant="white" className="h-6 w-auto" />
        </div>
        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {nav}
        </nav>
        {/* Rail footer */}
        {navFooter && (
          <div className="flex-shrink-0 border-t border-brand-900 px-3 py-3 space-y-0.5">
            {navFooter}
          </div>
        )}
      </aside>

      {/* Right column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Impersonation banner */}
        {impersonationBanner && (
          <div className="flex-shrink-0 bg-amber-light border-b border-amber px-5 py-2 text-[13px] font-semibold text-[#92600A] flex items-center gap-3">
            {impersonationBanner}
          </div>
        )}

        {/* Top bar */}
        <TopBar
          impersonating={impersonating}
          left={
            <span className="text-[13px] font-bold text-near-black tracking-tight flex items-center gap-2">
              Platform
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-brand-700 text-white uppercase tracking-wider">
                console
              </span>
            </span>
          }
          right={topRight}
        />

        {/* Page content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
