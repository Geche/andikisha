"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export type IdleStatus = "active" | "warning" | "expired";

interface UseIdleTimeoutOptions {
  thresholdMs: number;
  warningMs: number;
  onExpire?: () => void;
  /** Override for dev/test. Falls back to thresholdMs if not set. */
  devThresholdMs?: number;
}

export function useIdleTimeout({
  thresholdMs,
  warningMs,
  onExpire,
  devThresholdMs,
}: UseIdleTimeoutOptions): { status: IdleStatus; resetTimer: () => void } {
  const effectiveThreshold = devThresholdMs ?? thresholdMs;
  const [status, setStatus] = useState<IdleStatus>("active");
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const expireTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimers = useCallback(() => {
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (expireTimer.current)  clearTimeout(expireTimer.current);
  }, []);

  const resetTimer = useCallback(() => {
    clearTimers();
    setStatus("active");
    warningTimer.current = setTimeout(() => setStatus("warning"), effectiveThreshold - warningMs);
    expireTimer.current  = setTimeout(() => {
      setStatus("expired");
      onExpire?.();
    }, effectiveThreshold);
  }, [clearTimers, effectiveThreshold, warningMs, onExpire]);

  useEffect(() => {
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"] as const;

    function handleActivity() {
      // Don't reset if already expired — let the expiry handler take over.
      setStatus((s) => {
        if (s === "expired") return s;
        resetTimer();
        return "active";
      });
    }

    events.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handleActivity));
      clearTimers();
    };
    // resetTimer changes identity if effectiveThreshold/warningMs change — intentional.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveThreshold, warningMs]);

  return { status, resetTimer };
}
