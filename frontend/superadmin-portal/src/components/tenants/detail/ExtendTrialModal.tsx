"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  isPending?: boolean;
  onConfirm: (days: number) => void;
  onClose: () => void;
}

export function ExtendTrialModal({ isPending, onConfirm, onClose }: Props) {
  const [days, setDays] = useState(14);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-[380px] p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-[16px] font-bold text-[#02110C]">Extend Trial</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <p className="text-[13.5px] text-gray-600 mb-4">Add additional days to the current trial period.</p>
        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Additional Days (1–90)</label>
          <input
            type="number" min={1} max={90} value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E]"
          />
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold text-[13.5px] h-10 rounded-lg hover:bg-gray-50">Cancel</button>
          <button
            onClick={() => onConfirm(days)}
            disabled={isPending || days < 1 || days > 90}
            className="flex-1 bg-[#E8A020] hover:bg-[#C98510] disabled:opacity-50 text-[#02110C] font-bold text-[13.5px] h-10 rounded-lg transition-colors"
          >
            {isPending ? "Extending…" : `Extend +${days} days`}
          </button>
        </div>
      </div>
    </div>
  );
}
