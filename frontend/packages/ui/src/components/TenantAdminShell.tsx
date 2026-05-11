import { cn } from "../utils";
import { TopBar } from "./TopBar";
import { LogoFull } from "./LogoFull";
import type { ReactNode } from "react";

interface TenantAdminShellProps {
  /** Sidebar nav content */
  nav: ReactNode;
  /** Footer content inside nav rail */
  navFooter?: ReactNode;
  /** Tenant name shown in top bar */
  tenantName?: string;
  /** Top-bar right slot */
  topRight?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Tenant Admin shell — light left rail, light top bar.
 * Used by admin-portal for ADMIN, HR_MANAGER, PAYROLL_OFFICER, HR, LINE_MANAGER.
 */
export function TenantAdminShell({
  nav,
  navFooter,
  tenantName,
  topRight,
  children,
  className,
}: TenantAdminShellProps) {
  return (
    <div className={cn("flex h-screen overflow-hidden bg-surface-alt", className)}>
      {/* Left rail — light */}
      <aside className="w-[240px] flex-shrink-0 flex flex-col h-full bg-surface border-r border-[#E5E7EB]">
        {/* Logo area — same height as TopBar (56px) */}
        <div className="h-[56px] flex items-center px-4 flex-shrink-0 border-b border-[#E5E7EB]">
          <LogoFull className="h-6 w-auto" />
        </div>
        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {nav}
        </nav>
        {/* Rail footer */}
        {navFooter && (
          <div className="flex-shrink-0 border-t border-[#E5E7EB] px-3 py-3 space-y-0.5">
            {navFooter}
          </div>
        )}
      </aside>

      {/* Right column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar
          left={
            tenantName ? (
              <span className="text-[14px] font-bold text-near-black tracking-tight truncate max-w-[200px]">
                {tenantName}
              </span>
            ) : undefined
          }
          right={topRight}
        />
        <main className="flex-1 flex flex-col overflow-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
