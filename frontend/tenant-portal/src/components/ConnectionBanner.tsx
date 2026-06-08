"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { CONNECTION_DEGRADED, CONNECTION_OK } from "@/lib/api-client";

/**
 * Non-blocking degradation notice. Appears when a licence check stays
 * unavailable after retries (W0) and auto-clears on the next successful
 * request. It never blocks the page — it is a slim status strip, not a modal.
 */
export function ConnectionBanner() {
  const [degraded, setDegraded] = useState(false);

  useEffect(() => {
    const onDegraded = () => setDegraded(true);
    const onOk = () => setDegraded(false);
    window.addEventListener(CONNECTION_DEGRADED, onDegraded);
    window.addEventListener(CONNECTION_OK, onOk);
    return () => {
      window.removeEventListener(CONNECTION_DEGRADED, onDegraded);
      window.removeEventListener(CONNECTION_OK, onOk);
    };
  }, []);

  if (!degraded) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-2 bg-warning-bg text-warning border-b border-warning px-4 py-2 text-[13px] font-medium"
    >
      <AlertTriangle size={16} aria-hidden="true" />
      <span>Reconnecting — some actions may be briefly unavailable. Retrying automatically.</span>
    </div>
  );
}
