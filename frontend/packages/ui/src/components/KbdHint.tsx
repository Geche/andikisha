import { cn } from "../utils";

export function KbdHint({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-[#E5E7EB]",
        "text-[11px] font-mono font-medium text-[#6B7280] bg-[#F9FAFB] leading-none",
        className
      )}
    >
      {children}
    </kbd>
  );
}
