"use client";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "../lib/useOnlineStatus";
import { cn } from "../utils";

export function OfflineBadge({ className }: { className?: string }) {
  const online = useOnlineStatus();
  if (online) return null;
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2.5 py-1 rounded-full",
      "bg-amber-light text-[#92600A] text-[12px] font-semibold",
      className
    )}>
      <WifiOff size={11} />
      Offline
    </span>
  );
}
