import { cn } from "../utils";
import type { ReactNode, ElementType } from "react";

interface EmptyStateProps {
  icon?: ElementType;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center px-6", className)}>
      {Icon && <Icon size={40} strokeWidth={1.5} className="text-neutral-300 mb-4" />}
      <p className="text-[15px] font-semibold text-neutral-700 mb-1">{title}</p>
      <p className="text-[13px] text-neutral-500 max-w-xs">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
