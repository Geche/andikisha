"use client";

import { X } from "lucide-react";

interface Props {
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: "danger" | "amber" | "primary";
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  title, message, confirmLabel, confirmVariant = "danger", isPending, onConfirm, onClose,
}: Props) {
  const btnClass = {
    danger:  "bg-red-600 hover:bg-red-700 text-white",
    amber:   "bg-[#E8A020] hover:bg-[#C98510] text-[#02110C]",
    primary: "bg-[#0B3D2E] hover:bg-[#0a3328] text-white",
  }[confirmVariant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-[400px] p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-[16px] font-bold text-[#02110C] pr-4">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={18} /></button>
        </div>
        <p className="text-[13.5px] text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold text-[13.5px] h-10 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`flex-1 font-bold text-[13.5px] h-10 rounded-lg transition-colors disabled:opacity-50 ${btnClass}`}
          >
            {isPending ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
