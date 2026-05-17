"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, AlertTriangle, FileText } from "lucide-react";
import { PageHeader } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";

interface Payslip {
  id: string;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  grossPay: number;
  netPay: number;
  paye: number;
  nhif: number;
  nssf: number;
  housingLevy: number;
  status: string;
  generatedAt: string;
}

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PAID: "bg-brand-100 text-brand-800",
    DRAFT: "bg-gray-100 text-gray-500",
  };
  const cls = map[status] ?? "bg-gray-100 text-gray-500";
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function fmt(amount: number) {
  return `KES ${amount.toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function PayslipRow({ p, onClick }: { p: Payslip; onClick: () => void }) {
  return (
    <tr
      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
            <FileText size={15} className="text-brand-900" />
          </div>
          <div>
            <p className="text-[13.5px] font-semibold text-near-black">{p.periodLabel}</p>
            <p className="text-[12px] text-gray-400">{p.periodStart} – {p.periodEnd}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-right text-[13px] text-gray-500">{fmt(p.grossPay)}</td>
      <td className="px-6 py-4 text-right text-[13.5px] font-bold text-near-black">{fmt(p.netPay)}</td>
      <td className="px-6 py-4 text-right">
        <StatusBadge status={p.status} />
      </td>
      <td className="px-6 py-4 text-right">
        <button
          onClick={(e) => { e.stopPropagation(); }}
          className="flex items-center gap-1 text-[12px] font-semibold text-brand-900 hover:text-brand-700 ml-auto"
        >
          <Download size={13} /> PDF
        </button>
      </td>
    </tr>
  );
}

function PayslipDetail({ p, onClose }: { p: Payslip; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-[18px] font-bold text-near-black">{p.periodLabel} Payslip</h2>
            <p className="text-[13px] text-gray-500 mt-0.5">{p.periodStart} – {p.periodEnd}</p>
          </div>
          <StatusBadge status={p.status} />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between py-2.5 border-b border-gray-100">
            <span className="text-[13.5px] font-semibold text-gray-700">Gross Pay</span>
            <span className="text-[13.5px] font-bold text-near-black">{fmt(p.grossPay)}</span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 pt-1">Deductions</p>
          {[
            { label: "PAYE", value: p.paye },
            { label: "NHIF / SHIF", value: p.nhif },
            { label: "NSSF", value: p.nssf },
            { label: "Housing Levy (1.5%)", value: p.housingLevy },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-1.5">
              <span className="text-[13px] text-gray-500">{label}</span>
              <span className="text-[13px] text-gray-700">({fmt(value)})</span>
            </div>
          ))}
          <div className="flex justify-between py-3 border-t-2 border-brand-900/20 mt-2">
            <span className="text-[15px] font-bold text-brand-900">Net Pay</span>
            <span className="text-[15px] font-bold text-brand-900">{fmt(p.netPay)}</span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold text-[13.5px] h-10 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
          <button className="flex-1 flex items-center justify-center gap-1.5 bg-brand-900 hover:bg-brand-950 text-white font-semibold text-[13.5px] h-10 rounded-lg transition-colors">
            <Download size={14} /> Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PayslipsPage() {
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Payslip | null>(null);

  const { data, isLoading, isError } = useQuery<PagedResponse<Payslip>>({
    queryKey: ["payslips", page],
    queryFn: () =>
      apiClient
        .get(`/api/v1/payslips?page=${page}&size=12&sort=periodStart,desc`)
        .then((r) => r.data),
  });

  const payslips = data?.content ?? [];
  const total = data?.totalElements ?? 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Payslips"
        subtitle={`${total} payslip${total !== 1 ? "s" : ""} on record`}
      />

      <div className="flex-1 overflow-y-auto px-8 py-8">
        {isError && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700 mb-5">
            <AlertTriangle size={15} className="flex-shrink-0" />
            Could not load payslips. Please try again later.
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="space-y-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="px-6 py-4 border-b border-gray-50 flex items-center gap-3">
                  <div className="w-9 h-9 bg-gray-100 rounded-xl animate-pulse"/>
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-32 bg-gray-100 rounded-full animate-pulse"/>
                    <div className="h-2 w-24 bg-gray-100 rounded-full animate-pulse"/>
                  </div>
                  <div className="h-3 w-20 bg-gray-100 rounded-full animate-pulse"/>
                </div>
              ))}
            </div>
          ) : payslips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText size={36} className="text-gray-200 mb-3" strokeWidth={1.5} />
              <p className="text-[14px] font-semibold text-gray-400">No payslips yet</p>
              <p className="text-[13px] text-gray-300 mt-1">They will appear here after your first payroll run</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Period</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Gross</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Net Pay</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold text-gray-400 uppercase tracking-wide">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {payslips.map((p) => (
                    <PayslipRow key={p.id} p={p} onClick={() => setSelected(p)} />
                  ))}
                </tbody>
              </table>
              {(data?.totalPages ?? 0) > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                  <p className="text-[12px] text-gray-400">
                    Page {page + 1} of {data?.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(0, p - 1))}
                      disabled={page === 0}
                      className="text-[12px] font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 border border-gray-200 rounded-lg"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page + 1 >= (data?.totalPages ?? 1)}
                      className="text-[12px] font-semibold text-gray-500 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed px-3 py-1.5 border border-gray-200 rounded-lg"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {selected && <PayslipDetail p={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}
