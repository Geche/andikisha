"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, ArrowUpCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { RenewModal } from "./RenewModal";
import { UpgradeModal } from "./UpgradeModal";
import type { LicenceDetail, LicenceHistory } from "@/types/tenant";

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:    "bg-[#D1F5E6] text-[#0F5040]",
  TRIAL:     "bg-[#E8F5F0] text-[#166A50] border border-[#D1F5E6]",
  SUSPENDED: "bg-[#FEE2E2] text-[#991B1B]",
  EXPIRED:   "bg-gray-100 text-gray-500",
  CANCELLED: "bg-gray-100 text-gray-500",
};

function fmt(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function fmtKes(amount: number) {
  return `KES ${amount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
}

interface Props {
  tenantId: string;
  licence: LicenceDetail | null;
}

export function LicenceTab({ tenantId, licence }: Props) {
  const [showRenew, setShowRenew] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const { data: history = [] } = useQuery<LicenceHistory[]>({
    queryKey: ["licence-history", tenantId],
    queryFn: () =>
      apiClient.get(`/api/v1/super-admin/tenants/${tenantId}/licences/history`).then((r) => r.data),
  });

  if (!licence) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed border-gray-200 rounded-xl">
        <p className="text-[13px] text-gray-400">No licence on record</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <p className="text-[13px] font-bold text-[#02110C]">Current Licence</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRenew(true)}
                className="flex items-center gap-1.5 border border-gray-200 text-gray-600 font-semibold text-[13px] h-8 px-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={13} /> Renew
              </button>
              <button
                onClick={() => setShowUpgrade(true)}
                className="flex items-center gap-1.5 bg-[#E8A020] hover:bg-[#C98510] text-[#02110C] font-semibold text-[13px] h-8 px-3 rounded-lg transition-colors"
              >
                <ArrowUpCircle size={13} /> Upgrade
              </button>
            </div>
          </div>
          <div className="px-6 py-4 grid grid-cols-3 gap-x-6 gap-y-4">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Plan</p>
              <p className="text-[13.5px] font-semibold text-[#02110C]">{licence.planName}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</p>
              <span className={`inline-flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[licence.status] ?? "bg-gray-100 text-gray-500"}`}>
                <span className="w-[5px] h-[5px] rounded-full bg-current" />
                {licence.status.charAt(0) + licence.status.slice(1).toLowerCase()}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Billing</p>
              <p className="text-[13.5px] text-[#02110C]">{licence.billingCycle.charAt(0) + licence.billingCycle.slice(1).toLowerCase()}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Seats</p>
              <p className="text-[13.5px] text-[#02110C]">{licence.seatCount}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Agreed Price</p>
              <p className="text-[13.5px] text-[#02110C]">{fmtKes(licence.agreedPriceKes)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Ends</p>
              <p className="text-[13.5px] text-[#02110C]">{fmt(licence.endDate)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Start Date</p>
              <p className="text-[13.5px] text-[#02110C]">{fmt(licence.startDate)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Licence Key</p>
              <code className="text-[12px] font-mono text-gray-500">{licence.licenceKey}</code>
            </div>
          </div>
        </div>

        {history.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-[13px] font-bold text-[#02110C]">History</p>
            </div>
            <table className="w-full">
              <thead className="bg-[#FAFAFA]">
                <tr>
                  {["Date", "Change", "Changed by", "Reason"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.05em] text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-t border-gray-50">
                    <td className="px-5 py-3 text-[13px] text-gray-500">{fmt(h.changedAt)}</td>
                    <td className="px-5 py-3">
                      <span className="text-[12px] text-gray-400">{h.previousStatus}</span>
                      <span className="text-[12px] text-gray-400 mx-1.5">→</span>
                      <span className="text-[12px] font-semibold text-[#02110C]">{h.newStatus}</span>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-gray-500">{h.changedBy}</td>
                    <td className="px-5 py-3 text-[13px] text-gray-500">{h.changeReason ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showRenew && (
        <RenewModal
          tenantId={tenantId}
          currentPlanId={licence.planId}
          onClose={() => setShowRenew(false)}
        />
      )}
      {showUpgrade && (
        <UpgradeModal
          tenantId={tenantId}
          currentPlanId={licence.planId}
          currentSeatCount={licence.seatCount}
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </>
  );
}
