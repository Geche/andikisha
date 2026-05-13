"use client";

import { useEffect } from "react";

export function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw-my.js", { scope: "/my/" })
        .catch((err) => console.error("[sw] registration failed:", err));
    }
  }, []);

  return null;
}
