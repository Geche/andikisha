import { cn } from "../utils";

export function KbdHint({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-neutral-200",
        "text-[11px] font-mono font-medium text-neutral-500 bg-neutral-50 leading-none",
        className
      )}
    >
      {children}
    </kbd>
  );
}
