import type { ReactNode } from "react";
import { cn } from "../utils";

interface SkeletonProps {
  className?: string;
  pill?: boolean;
}

/**
 * Single placeholder block.
 *
 * Decorative: marked `aria-hidden` so screen readers skip the shimmer. Announce
 * the loading state on the wrapping region instead — use {@link SkeletonRegion}.
 *
 * Reduced motion: under `prefers-reduced-motion: reduce` the pulse is disabled
 * and the block falls back to a static muted placeholder.
 */
export function Skeleton({ className, pill }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        "animate-pulse bg-neutral-100 motion-reduce:animate-none",
        pill ? "rounded-full" : "rounded-md",
        className
      )}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          pill
          className={cn("h-3", i === lines - 1 && lines > 1 ? "w-3/4" : "w-full")}
        />
      ))}
    </div>
  );
}

/**
 * Wraps a group of {@link Skeleton} placeholders in an accessible loading
 * region. Sets `aria-busy` while loading and exposes a visually-hidden status
 * label so assistive tech announces the wait without reading the decorative
 * shimmer blocks.
 *
 * Consume this around any skeleton layout instead of re-implementing the
 * aria-busy / role=status plumbing per surface.
 */
export function SkeletonRegion({
  children,
  label = "Loading",
  busy = true,
  className,
}: {
  children: ReactNode;
  /** Screen-reader label for the region. Defaults to "Loading". */
  label?: string;
  /** Whether the region is currently loading. Defaults to true. */
  busy?: boolean;
  className?: string;
}) {
  return (
    <div role="status" aria-busy={busy} aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}
