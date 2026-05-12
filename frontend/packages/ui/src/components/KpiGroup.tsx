import type { ReactNode } from "react";
import { cn } from "../utils";

interface KpiGroupProps {
  children: ReactNode;
  cols?: 2 | 3 | 4;
  className?: string;
}

const COLS_CLASSES: Record<2 | 3 | 4, string> = {
  2: "grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function KpiGroup({ children, cols = 4, className }: KpiGroupProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-5",
        COLS_CLASSES[cols],
        className
      )}
    >
      {children}
    </div>
  );
}
