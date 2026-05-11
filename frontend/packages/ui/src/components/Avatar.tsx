import { cn } from "../utils";

interface AvatarProps {
  name?: string;
  src?: string;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

function initials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return (parts[0]?.[0] ?? "?").toUpperCase();
  return ((parts[0]?.[0] ?? "") + (parts[parts.length - 1]?.[0] ?? "")).toUpperCase();
}

const SIZE: Record<string, string> = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-[11px]",
  md: "w-10 h-10 text-[13px]",
  lg: "w-14 h-14 text-[18px]",
};

export function Avatar({ name, src, size = "md", className }: AvatarProps) {
  const base = cn(
    "rounded-full flex items-center justify-center font-bold flex-shrink-0 overflow-hidden select-none",
    SIZE[size],
    className
  );
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt={name ?? ""} className={cn(base, "object-cover")} />;
  }
  return (
    <div className={cn(base, "bg-brand-900 text-white")}>
      {initials(name)}
    </div>
  );
}
