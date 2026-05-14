import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

/**
 * Page-level header — title, subtitle, and right-side actions.
 * Height h-[73px] matches the sidebar logo row so they sit on the same
 * horizontal line. Border uses the same #E5E7EB hairline as the shell.
 */
export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="bg-surface border-b border-neutral-200 px-8 flex-shrink-0">
      <div className="flex items-center justify-between h-[73px] gap-4">
        <div className="min-w-0">
          <h1 className="text-[20px] font-bold text-near-black tracking-tight leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-[13px] text-neutral-500 mt-0.5 truncate">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
        )}
      </div>
    </div>
  );
}
