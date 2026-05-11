import { cn } from "../utils";

export type TagColor = "sage" | "sand" | "terracotta" | "rose" | "mauve" | "stone" | "sky" | "default";

const COLOR_CLASSES: Record<TagColor, string> = {
  sage:       "bg-[#CFD4C6] text-[#3D4A36]",
  sand:       "bg-[#E5DDCE] text-[#5C4D2E]",
  terracotta: "bg-[#DFC2C0] text-[#6B2E2C]",
  rose:       "bg-[#E3C6D1] text-[#6B2C46]",
  mauve:      "bg-[#D8CDE0] text-[#4A3363]",
  stone:      "bg-[#D5D3CF] text-[#3D3B37]",
  sky:        "bg-[#C6D8E3] text-[#2C4A5C]",
  default:    "bg-[#F3F4F6] text-[#374151]",
};

const COLORS: TagColor[] = ["sage", "sand", "terracotta", "rose", "mauve", "stone", "sky"];

export function tagColorFor(value: string): TagColor {
  let hash = 0;
  for (let i = 0; i < value.length; i++) hash = (hash * 31 + value.charCodeAt(i)) | 0;
  return COLORS[Math.abs(hash) % COLORS.length]!;
}

interface TagProps {
  color?: TagColor;
  size?: "sm" | "md";
  className?: string;
  children: React.ReactNode;
}

export function Tag({ color = "default", size = "md", className, children }: TagProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md font-medium",
        size === "sm" ? "px-1.5 py-0.5 text-[11px]" : "px-2 py-0.5 text-[12px]",
        COLOR_CLASSES[color],
        className
      )}
    >
      {children}
    </span>
  );
}
