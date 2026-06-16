import { cn } from "../utils";

interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  /** Accessible label announced to screen readers. Defaults to "Loading". */
  label?: string;
}

const SIZE: Record<string, string> = {
  sm: "w-3.5 h-3.5 border-[1.5px]",
  md: "w-5 h-5 border-2",
  lg: "w-7 h-7 border-2",
};

/**
 * Indeterminate loading indicator.
 *
 * Accessibility: wrapped in a `role="status"` region with a visually-hidden
 * label so screen readers announce the wait; the rotating arc itself is
 * `aria-hidden`.
 *
 * Reduced motion: under `prefers-reduced-motion: reduce` the spin animation is
 * disabled and the indicator falls back to a static, uniform muted ring rather
 * than a frozen mid-spin arc.
 */
export function Spinner({ size = "md", className, label = "Loading" }: SpinnerProps) {
  return (
    <span role="status" className={cn("inline-flex", className)}>
      <span
        aria-hidden="true"
        className={cn(
          "block rounded-full border-neutral-200 border-t-brand-700 animate-spin",
          // Reduced motion: stop spinning and drop the directional top arc so it
          // reads as an intentional static placeholder, not a frozen spinner.
          "motion-reduce:animate-none motion-reduce:border-neutral-300 motion-reduce:border-t-neutral-300",
          SIZE[size]
        )}
      />
      <span className="sr-only">{label}</span>
    </span>
  );
}
