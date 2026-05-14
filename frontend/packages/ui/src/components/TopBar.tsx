import { cn } from "../utils";
import type { ReactNode } from "react";

interface TopBarProps {
  left?: ReactNode;
  center?: ReactNode;
  right?: ReactNode;
  /** 2px amber bottom border shown when impersonating a tenant */
  impersonating?: boolean;
  className?: string;
}

export function TopBar({ left, center, right, impersonating, className }: TopBarProps) {
  return (
    <header
      className={cn(
        "flex-shrink-0 flex items-center justify-between px-5 bg-surface border-b border-neutral-200",
        "h-[56px] z-30",
        impersonating && "border-b-2 border-b-amber",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0">{left}</div>
      {center && <div className="flex-1 flex justify-center px-4">{center}</div>}
      <div className="flex items-center gap-2 flex-shrink-0">{right}</div>
    </header>
  );
}
