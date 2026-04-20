"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function MobileCTABar() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-neutral-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] p-3 flex gap-2.5 transition-all duration-300 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
      }`}
    >
      <Link href="/pricing" className="btn-primary flex-1 justify-center text-sm py-2.5">
        Start Free
      </Link>
      <Link href="/demo" className="btn-outline-dark flex-1 justify-center text-sm py-2.5">
        Request Demo
      </Link>
    </div>
  );
}
