"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toaster";
import { BaseModal } from "@/components/ui/BaseModal";
import type { Plan } from "@/types/tenant";

interface Props {
  tenantId: string;
  currentPlanId: string;
  onClose: () => void;
}

const INPUT = "w-full border border-gray-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E]";

export function RenewModal({ tenantId, currentPlanId, onClose }: Props) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [planId, setPlanId] = useState(currentPlanId);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [seatCount, setSeatCount] = useState(10);
  const [agreedPriceKes, setAgreedPriceKes] = useState(0);
  const [newEndDate, setNewEndDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  });

  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: () => apiClient.get("/api/v1/plans").then((r) => r.data),
  });

  const renew = useMutation({
    mutationFn: () =>
      apiClient.post(`/api/v1/super-admin/tenants/${tenantId}/licences/renew`, {
        planId, billingCycle, seatCount, agreedPriceKes, newEndDate,
      }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-detail", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["licence-history", tenantId] });
      toast("Licence renewed", "success");
      onClose();
    },
    onError: (err: unknown) => {
      const msg =
        err instanceof Error
          ? err.message
          : (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Renewal failed";
      toast(msg, "error");
    },
  });

  return (
    <BaseModal labelId="renew-modal-title" onClose={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-[480px] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 id="renew-modal-title" className="text-[16px] font-bold text-[#02110C]">Renew Licence</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Plan</label>
            <select value={planId} onChange={(e) => setPlanId(e.target.value)} className={INPUT}>
              {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Billing Cycle</label>
              <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value as "MONTHLY" | "ANNUAL")} className={INPUT}>
                <option value="MONTHLY">Monthly</option>
                <option value="ANNUAL">Annual</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Seats</label>
              <input type="number" min={1} value={seatCount} onChange={(e) => setSeatCount(Number(e.target.value))} className={INPUT} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Agreed Price (KES)</label>
              <input type="number" min={0} step="0.01" value={agreedPriceKes} onChange={(e) => setAgreedPriceKes(Number(e.target.value))} className={INPUT} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">New End Date</label>
              <input type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} className={INPUT} />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold text-[13.5px] h-10 rounded-lg hover:bg-gray-50">Cancel</button>
          <button
            onClick={() => renew.mutate()}
            disabled={renew.isPending}
            className="flex-1 bg-[#E8A020] hover:bg-[#C98510] disabled:opacity-50 text-[#02110C] font-bold text-[13.5px] h-10 rounded-lg transition-colors"
          >
            {renew.isPending ? "Renewing…" : "Renew Licence"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}
