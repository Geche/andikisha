import { cn } from "../utils";

interface SkeletonProps {
  className?: string;
  pill?: boolean;
}

export function Skeleton({ className, pill }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-[#F3F4F6]",
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
