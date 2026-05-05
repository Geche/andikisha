import { cn } from "@/lib/utils";

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  light?: boolean;
}

export default function Eyebrow({ children, className, light = false }: EyebrowProps) {
  return (
    <p
      className={cn(
        "text-[12px] font-semibold uppercase tracking-[0.14em] leading-none",
        light ? "text-amber" : "text-brand-700",
        className
      )}
    >
      {children}
    </p>
  );
}
