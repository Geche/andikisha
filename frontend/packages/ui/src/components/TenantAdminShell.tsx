import { cn } from "../utils";
import { LogoFull } from "./LogoFull";
import type { ReactNode } from "react";

interface TenantAdminShellProps {
  nav: ReactNode;
  navFooter?: ReactNode;
  children: ReactNode;
  className?: string;
}

/**
 * Tenant Admin shell — light left rail, no separate top bar.
 * The sidebar logo row aligns with each page's PageHeader (both h-[73px]).
 * Page-level title + actions live inside children via PageHeader.
 */
export function TenantAdminShell({
  nav,
  navFooter,
  children,
  className,
}: TenantAdminShellProps) {
  return (
    <div className={cn("flex h-screen overflow-hidden bg-surface-alt", className)}>
      {/* Left rail — light */}
      <aside className="w-[240px] flex-shrink-0 flex flex-col h-full bg-surface border-r border-neutral-200">
        {/* Logo row — height matches PageHeader h-[73px] */}
        <div className="h-[73px] flex items-center px-5 flex-shrink-0 border-b border-neutral-200">
          <LogoFull className="h-6 w-auto" />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {nav}
        </nav>

        {navFooter && (
          <div className="flex-shrink-0 border-t border-neutral-200 px-3 py-3 space-y-0.5">
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
