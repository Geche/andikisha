"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, AlertTriangle, FileText } from "lucide-react";
import { PageHeader, PaginationBar, Skeleton, SkeletonRegion, useCurrentUser } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { listErrorMessage } from "@/lib/queryError";

// Shape matches payroll-service PaySlipResponse (self-scoped via
// /api/v1/payroll/employees/{employeeId}/payslips — EMPLOYEE may read their own).
interface Payslip {
  id: string;
  period: string;
  grossPay: number;
  netPay: number;
  paye: number;
  nssf: number;
  shif: number;
  housingLevy: number;
  paymentStatus: string;
}

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

// Shape matches document-service DocumentResponse (self-service subset via
// /api/v1/documents/my — payslips / P9 forms the caller owns).
interface DocumentMeta {
  id: string;
  documentType: string;
  period: string;
}

// PDF bytes stream through the BFF proxy, which forwards the auth cookie; the
// gateway derives X-Employee-ID from the JWT, and document-service enforces
// own-scope + the payslip/P9 type allowlist. Same anchor pattern as the
// bulk-upload xlsx template download.
function downloadHref(documentId: string) {
  return `/api/proxy/api/v1/documents/${documentId}/download`;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    PAID: "bg-brand-100 text-brand-800",
    FAILED: "bg-red-100 text-red-700",
  };
  const cls = map[status] ?? "bg-neutral-100 text-neutral-500";
  const label = status ? status.charAt(0) + status.slice(1).toLowerCase().replace(/_/g, " ") : "—";
  return (
    <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${cls}`}>
      {label}
    </span>
  );
}

function fmt(amount: number | null | undefined) {
  return `KES ${(amount ?? 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function PayslipRow({ p, docId, onClick }: { p: Payslip; docId?: string; onClick: () => void }) {
  return (
    <tr
      className="border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer transition-colors"
      onClick={onClick}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
            <FileText size={15} className="text-brand-900" />
          </div>
          <p className="text-[13.5px] font-semibold text-near-black">{p.period}</p>
        </div>
      </td>
      <td className="px-6 py-4 text-right text-[13px] text-neutral-500">{fmt(p.grossPay)}</td>
      <td className="px-6 py-4 text-right text-[13.5px] font-bold text-near-black">{fmt(p.netPay)}</td>
      <td className="px-6 py-4 text-right">
        <StatusBadge status={p.paymentStatus} />
      </td>
      <td className="px-6 py-4 text-right">
        {docId ? (
          <a
            href={downloadHref(docId)}
            download
            onClick={(e) => { e.stopPropagation(); }}
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-brand-900 hover:text-brand-700 ml-auto"
          >
            <Download size={13} /> PDF
          </a>
        ) : (
          <span
            title="PDF not available yet"
            className="inline-flex items-center gap-1 text-[12px] font-semibold text-neutral-300 ml-auto cursor-default"
          >
            <Download size={13} /> PDF
          </span>
        )}
      </td>
    </tr>
  );
}

function PayslipDetail({ p, docId, onClose }: { p: Payslip; docId?: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-[18px] font-bold text-near-black">{p.period} Payslip</h2>
          <StatusBadge status={p.paymentStatus} />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between py-2.5 border-b border-neutral-100">
            <span className="text-[13.5px] font-semibold text-neutral-700">Gross Pay</span>
            <span className="text-[13.5px] font-bold text-near-black">{fmt(p.grossPay)}</span>
          </div>
          <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 pt-1">Deductions</p>
          {[
            { label: "PAYE", value: p.paye },
            { label: "SHIF", value: p.shif },
            { label: "NSSF", value: p.nssf },
            { label: "Housing Levy (1.5%)", value: p.housingLevy },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between py-1.5">
              <span className="text-[13px] text-neutral-500">{label}</span>
              <span className="text-[13px] text-neutral-700">({fmt(value)})</span>
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
            className="flex-1 border border-neutral-200 text-neutral-600 font-semibold text-[13.5px] h-10 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            Close
          </button>
          {docId ? (
            <a
              href={downloadHref(docId)}
              download
              className="flex-1 flex items-center justify-center gap-1.5 bg-brand-900 hover:bg-brand-950 text-white font-semibold text-[13.5px] h-10 rounded-lg transition-colors"
            >
              <Download size={14} /> Download PDF
            </a>
          ) : (
            <span
              title="PDF not available yet"
              className="flex-1 flex items-center justify-center gap-1.5 bg-neutral-100 text-neutral-400 font-semibold text-[13.5px] h-10 rounded-lg cursor-default"
            >
              <Download size={14} /> Not available yet
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PayslipsPage() {
  const currentUser = useCurrentUser();
  const employeeId = currentUser?.employeeId;
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<Payslip | null>(null);

  const { data, isLoading, isError, error } = useQuery<PagedResponse<Payslip>>({
    queryKey: ["payslips", employeeId, page, pageSize],
    queryFn: () =>
      apiClient
        .get(`/api/v1/payroll/employees/${employeeId}/payslips?page=${page}&size=${pageSize}`)
        .then((r) => r.data),
    enabled: !!employeeId,
  });

  // Self-service document metadata — used to resolve each payslip period to its
  // downloadable PDF documentId. Bounded list (payslips + P9s), fetched once.
  const { data: myDocs } = useQuery<DocumentMeta[]>({
    queryKey: ["my-documents", employeeId],
    queryFn: () => apiClient.get(`/api/v1/documents/my`).then((r) => r.data),
    enabled: !!employeeId,
  });

  const payslipDocByPeriod = new Map<string, string>(
    (myDocs ?? [])
      .filter((d) => d.documentType === "PAYSLIP" && d.period)
      .map((d) => [d.period, d.id])
  );

  const payslips = data?.content ?? [];
  const total = data?.totalElements ?? 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Payslips"
        subtitle={`${total} payslip${total !== 1 ? "s" : ""} on record`}
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8">
        {!employeeId && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 text-center bg-white border border-neutral-200 rounded-xl">
            <FileText size={36} className="text-neutral-200 mb-3" strokeWidth={1.5} />
            <p className="text-[14px] font-semibold text-neutral-400">No payslips</p>
            <p className="text-[13px] text-neutral-300 mt-1">This account isn’t linked to an employee record.</p>
          </div>
        ) : (
        <>
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <SkeletonRegion label="Loading payslips" className="space-y-0">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="px-6 py-4 border-b border-neutral-50 flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton pill className="h-3 w-32" />
                    <Skeleton pill className="h-2 w-24" />
                  </div>
                  <Skeleton pill className="h-3 w-20" />
                </div>
              ))}
            </SkeletonRegion>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertTriangle size={36} className="text-neutral-200 mb-3" strokeWidth={1.5} />
              <p className="text-[14px] font-semibold text-neutral-400">Couldn&rsquo;t load payslips</p>
              <p className="text-[13px] text-neutral-300 mt-1">{listErrorMessage(error, "payslips")}</p>
            </div>
          ) : payslips.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <FileText size={36} className="text-neutral-200 mb-3" strokeWidth={1.5} />
              <p className="text-[14px] font-semibold text-neutral-400">No payslips yet</p>
              <p className="text-[13px] text-neutral-300 mt-1">They will appear here after your first payroll run</p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Period</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Gross</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Net Pay</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Status</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Download</th>
                  </tr>
                </thead>
                <tbody>
                  {payslips.map((p) => (
                    <PayslipRow
                      key={p.id}
                      p={p}
                      docId={payslipDocByPeriod.get(p.period)}
                      onClick={() => setSelected(p)}
                    />
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-4 border-t border-neutral-100">
                <PaginationBar
                  currentPage={page}
                  totalPages={data?.totalPages ?? 0}
                  totalCount={data?.totalElements ?? 0}
                  pageSize={pageSize}
                  itemLabel="payslips"
                  onPageChange={setPage}
                  onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
                />
              </div>
            </>
          )}
        </div>
        </>
        )}
      </div>

      {selected && (
        <PayslipDetail
          p={selected}
          docId={payslipDocByPeriod.get(selected.period)}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
