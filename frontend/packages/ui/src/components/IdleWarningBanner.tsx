"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Clock } from "lucide-react";
import { useIdleTimeout } from "../lib/useIdleTimeout";

interface IdleWarningBannerProps {
  /** Total idle threshold in ms before hard logout (e.g. 30 * 60 * 1000). */
  thresholdMs: number;
  /** How many ms before expiry to show the warning (e.g. 2 * 60 * 1000). */
  warningMs: number;
  /** Cookie to clear on logout (tenant_token or platform_token). */
  cookieName: string;
  /** BFF logout endpoint — defaults to /api/auth/logout. */
  logoutPath?: string;
  /**
   * Allowed path prefixes for returnTo validation.
   * e.g. ["/my/", "/admin/"] for tenant-portal; ["/"] for platform-portal.
   */
  returnToAllowedPrefixes?: string[];
  /**
   * DEV ONLY: override threshold for faster testing.
   * Set NEXT_PUBLIC_IDLE_TIMEOUT_MS env var or pass directly.
   */
  devThresholdMs?: number;
}

export function IdleWarningBanner({
  thresholdMs,
  warningMs,
  cookieName,
  logoutPath = "/api/auth/logout",
  returnToAllowedPrefixes = ["/"],
  devThresholdMs,
}: IdleWarningBannerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [secondsLeft, setSecondsLeft] = useState(Math.ceil(warningMs / 1000));

  const handleExpire = useCallback(async () => {
    // Fire-and-forget logout — don't block the redirect on network.
    fetch(logoutPath, { method: "POST" }).catch(() => {});

    // Validate and encode returnTo.
    const safeReturn = returnToAllowedPrefixes.some((p) => pathname?.startsWith(p))
      ? encodeURIComponent(pathname ?? "/")
      : null;

    const loginUrl = safeReturn ? `/login?returnTo=${safeReturn}` : "/login";
    router.replace(loginUrl);
  }, [logoutPath, pathname, returnToAllowedPrefixes, router]);

  const { status, resetTimer } = useIdleTimeout({
    thresholdMs,
    warningMs,
    onExpire: handleExpire,
    devThresholdMs,
  });

  // Countdown in the warning state
  useEffect(() => {
    if (status !== "warning") {
      setSecondsLeft(Math.ceil(warningMs / 1000));
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [status, warningMs]);

  async function handleStaySignedIn() {
    resetTimer();
  }

  async function handleSignOutNow() {
    await fetch(logoutPath, { method: "POST" }).catch(() => {});
    router.replace("/login");
  }

  if (status !== "warning") return null;

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const timeLabel = mins > 0
    ? `${mins}:${String(secs).padStart(2, "0")}`
    : `${secs}s`;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[320px] bg-white rounded-xl border border-neutral-200 shadow-lg p-4 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-full bg-amber-light flex items-center justify-center flex-shrink-0">
          <Clock size={15} className="text-amber" />
        </div>
        <div className="min-w-0">
          <p className="text-[14px] font-bold text-near-black">Still there?</p>
          <p className="text-[12.5px] text-neutral-500 leading-snug mt-0.5">
            You'll be signed out in{" "}
            <span className="font-semibold text-amber-text">{timeLabel}</span>{" "}
            due to inactivity.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleStaySignedIn}
          className="flex-1 h-8 rounded-lg bg-brand-900 text-white text-[13px] font-semibold hover:bg-brand-800 transition-colors"
        >
          Stay signed in
        </button>
        <button
          onClick={handleSignOutNow}
          className="flex-1 h-8 rounded-lg border border-neutral-200 text-[13px] font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
