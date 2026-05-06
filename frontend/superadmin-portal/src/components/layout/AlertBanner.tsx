"use client";

import { AlertCircle, X } from "lucide-react";
import { useState } from "react";

interface AlertBannerProps {
  count: number;
  onReview: () => void;
}

export function AlertBanner({ count, onReview }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed || count === 0) return null;

  return (
    <div className="bg-[#FFFBEB] border-b border-[#FDE68A] px-8 py-2.5 flex items-center gap-2.5 flex-shrink-0">
      <AlertCircle size={14} className="text-[#C98510] flex-shrink-0" />
      <span className="text-[13px] text-[#92400E] flex-1">
        <strong>{count} trial{count > 1 ? "s" : ""} expire{count === 1 ? "s" : ""} in 48 hours</strong>
        {" "}— action needed before tenants lose access.
      </span>
      <button
        onClick={onReview}
        className="text-[12.5px] font-bold text-[#C98510] border border-[#F59E0B] rounded-md px-3 py-1 hover:bg-[#FEF3DC] transition-colors whitespace-nowrap"
      >
        Review now →
      </button>
      <button onClick={() => setDismissed(true)} className="text-gray-400 hover:text-gray-600 ml-1">
        <X size={14} />
      </button>
    </div>
  );
}
