import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200 px-8 flex-shrink-0">
      <div className="flex items-center justify-between h-[73px] gap-4">
        <div>
          <h1 className="text-[20px] font-bold text-[#101828] tracking-tight">{title}</h1>
          {subtitle && <p className="text-[13px] text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
