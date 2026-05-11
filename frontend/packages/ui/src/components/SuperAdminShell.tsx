import { cn } from "../utils";
import { LogoFull } from "./LogoFull";
import type { ReactNode } from "react";

interface SuperAdminShellProps {
  nav: ReactNode;
  navFooter?: ReactNode;
  /** Shown when impersonating a tenant — amber strip below logo */
  impersonationBanner?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * SuperAdmin shell — dark forest-green left rail, no separate top bar.
 * The sidebar logo row aligns with each page's PageHeader.
 * Page-level title + actions live inside children via PageHeader.
 */
export function SuperAdminShell({
  nav,
  navFooter,
  impersonationBanner,
  children,
  className,
}: SuperAdminShellProps) {
  return (
    <div className={cn("flex h-screen overflow-hidden bg-surface-alt", className)}>
      {/* Left rail — dark green */}
      <aside className="w-[240px] flex-shrink-0 flex flex-col h-full bg-brand-950 border-r border-brand-900">
        {/* Logo row — height matches PageHeader h-[73px] */}
        <div className="h-[73px] flex items-center px-5 flex-shrink-0 border-b border-brand-900">
          <LogoFull variant="white" className="h-6 w-auto" />
        </div>

        {impersonationBanner && (
          <div className="flex-shrink-0 bg-amber-light border-b border-amber px-4 py-2 text-[12px] font-semibold text-[#92600A]">
            {impersonationBanner}
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {nav}
        </nav>

        {navFooter && (
          <div className="flex-shrink-0 border-t border-brand-900 px-3 py-3 space-y-0.5">
            {navFooter}
          </div>
        )}
      </aside>

      {/* Main content — PageHeader goes here as first child */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
