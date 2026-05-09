"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  isPending?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function SuspendModal({ isPending, onConfirm, onClose }: Props) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-[420px] p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-[16px] font-bold text-[#02110C]">Suspend Tenant</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <p className="text-[13.5px] text-gray-600 mb-4">
          The tenant will lose access immediately. Provide a reason for the suspension record.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Non-payment of subscription fees"
          maxLength={500}
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold text-[13.5px] h-10 rounded-lg hover:bg-gray-50">Cancel</button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={isPending || reason.trim().length === 0}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-[13.5px] h-10 rounded-lg transition-colors"
          >
            {isPending ? "Suspending…" : "Suspend Tenant"}
          </button>
        </div>
      </div>
    </div>
  );
}
