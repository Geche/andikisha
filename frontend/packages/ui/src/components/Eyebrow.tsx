import { cn } from "../utils";

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-700", className)}>
      {children}
    </p>
  );
}
