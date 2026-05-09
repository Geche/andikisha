"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toaster";
import type { Plan } from "@/types/tenant";

interface Props {
  tenantId: string;
  currentPlanId: string;
  currentSeatCount: number;
  onClose: () => void;
}

const INPUT = "w-full border border-gray-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E]";

export function UpgradeModal({ tenantId, currentPlanId, currentSeatCount, onClose }: Props) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [newPlanId, setNewPlanId] = useState(currentPlanId);
  const [seatCount, setSeatCount] = useState(currentSeatCount);
  const [agreedPriceKes, setAgreedPriceKes] = useState(0);

  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: () => apiClient.get("/api/v1/plans").then((r) => r.data),
  });

  const upgrade = useMutation({
    mutationFn: () =>
      apiClient.post(`/api/v1/super-admin/tenants/${tenantId}/licences/upgrade`, {
        newPlanId, seatCount, agreedPriceKes,
      }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-detail", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["licence-history", tenantId] });
      toast("Licence upgraded", "success");
      onClose();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Upgrade failed";
      toast(msg, "error");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-[420px] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-bold text-[#02110C]">Upgrade Plan</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">New Plan</label>
            <select value={newPlanId} onChange={(e) => setNewPlanId(e.target.value)} className={INPUT}>
              {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Seats</label>
              <input type="number" min={1} value={seatCount} onChange={(e) => setSeatCount(Number(e.target.value))} className={INPUT} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Agreed Price (KES)</label>
              <input type="number" min={0} step="0.01" value={agreedPriceKes} onChange={(e) => setAgreedPriceKes(Number(e.target.value))} className={INPUT} />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold text-[13.5px] h-10 rounded-lg hover:bg-gray-50">Cancel</button>
          <button
            onClick={() => upgrade.mutate()}
            disabled={upgrade.isPending}
            className="flex-1 bg-[#0B3D2E] hover:bg-[#0a3328] disabled:opacity-50 text-white font-bold text-[13.5px] h-10 rounded-lg transition-colors"
          >
            {upgrade.isPending ? "Upgrading…" : "Upgrade"}
          </button>
        </div>
      </div>
    </div>
  );
}
