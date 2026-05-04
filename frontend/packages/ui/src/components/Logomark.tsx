import { cn } from "../utils";

type Variant = "default" | "white" | "black";

interface LogomarkProps {
  variant?: Variant;
  className?: string;
}

const COLORS: Record<Variant, { primary: string; accent: string }> = {
  default: { primary: "#0b3d2e", accent: "#e8a020" },
  white: { primary: "#ffffff", accent: "#ffffff" },
  black: { primary: "#000000", accent: "#000000" },
};

export function Logomark({ variant = "default", className }: LogomarkProps) {
  const c = COLORS[variant];
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 575.466 575.466"
      aria-hidden="true"
      className={cn("h-8 w-8", className)}
    >
      <path
        d="M259.16,74.741c-32.128,0-61.825,17.104-77.947,44.894L24.226,390.689c-28.326,50.116,19.61,110.037,77.352,110.037h22.879L370.679,74.741h-111.519Z"
        fill={c.primary}
      />
      <path
        d="M554.801,396.136l-102.411-178.674-163.421,283.263h191.748c55.563-1.089,92.605-54.473,74.084-104.589Z"
        fill={c.accent}
      />
    </svg>
  );
}
