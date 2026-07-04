"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ScrollText, Eye, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PageHeader, PaginationBar, Skeleton, SkeletonRegion, useToast } from "@andikisha/ui";
import type { AxiosError } from "axios";
import { apiClient } from "@/lib/api-client";
import { listErrorMessage } from "@/lib/queryError";

// Shape matches document-service DocumentResponse (DRAFT Certificates of Service).
interface CertificateDraft {
  id: string;
  employeeName: string;
  title: string;
  createdAt: string;
}

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function IssueButton({ id }: { id: string }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const mutation = useMutation<void, AxiosError<{ message?: string }>, void>({
    mutationFn: () => apiClient.post(`/api/v1/documents/${id}/issue`).then(() => undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["certificate-drafts"] });
      toast("Certificate issued", "success");
    },
    onError: (err) =>
      toast(err.response?.data?.message ?? "Failed to issue certificate. Please try again.", "error"),
  });

  return (
    <button
      type="button"
      disabled={mutation.isPending}
      onClick={() => mutation.mutate()}
      className="inline-flex items-center gap-1.5 bg-brand-900 hover:bg-brand-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[12px] px-3 h-8 rounded-lg transition-colors"
    >
      <CheckCircle2 size={13} aria-hidden="true" />
      {mutation.isPending ? "Issuing…" : "Issue"}
    </button>
  );
}

export default function CertificatesPage() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const { data, isLoading, isError, error } = useQuery<PagedResponse<CertificateDraft>>({
    queryKey: ["certificate-drafts", page, pageSize],
    queryFn: () =>
      apiClient
        .get(`/api/v1/documents/certificates/drafts?page=${page}&size=${pageSize}`)
        .then((r) => r.data),
  });

  const drafts = data?.content ?? [];
  const total = data?.totalElements ?? 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Certificates"
        subtitle="Review and issue Certificates of Service for terminated employees."
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8">
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
          {isLoading ? (
            <SkeletonRegion label="Loading draft certificates" className="space-y-0">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="px-6 py-4 border-b border-neutral-50 flex items-center gap-3">
                  <Skeleton className="w-9 h-9 rounded-xl" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton pill className="h-3 w-40" />
                    <Skeleton pill className="h-2 w-24" />
                  </div>
                  <Skeleton pill className="h-3 w-24" />
                </div>
              ))}
            </SkeletonRegion>
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertTriangle size={36} className="text-neutral-200 mb-3" strokeWidth={1.5} />
              <p className="text-[14px] font-semibold text-neutral-400">Couldn&rsquo;t load certificates</p>
              <p className="text-[13px] text-neutral-300 mt-1">{listErrorMessage(error, "certificates")}</p>
            </div>
          ) : drafts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <ScrollText size={36} className="text-neutral-200 mb-3" strokeWidth={1.5} />
              <p className="text-[14px] font-semibold text-neutral-400">No certificates to issue</p>
              <p className="text-[13px] text-neutral-300 mt-1">
                Drafts appear here when an employee is terminated.
              </p>
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Employee</th>
                    <th className="px-6 py-3 text-left text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Drafted</th>
                    <th className="px-6 py-3 text-right text-[11px] font-semibold text-neutral-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {drafts.map((d) => (
                    <tr key={d.id} className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                            <ScrollText size={15} className="text-brand-900" />
                          </div>
                          <p className="text-[13.5px] font-semibold text-near-black">{d.employeeName}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-neutral-500">{fmtDate(d.createdAt)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={`/api/proxy/api/v1/documents/${d.id}/download`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[12px] px-3 h-8 rounded-lg transition-colors"
                          >
                            <Eye size={13} aria-hidden="true" /> Preview
                          </a>
                          <IssueButton id={d.id} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-6 py-4 border-t border-neutral-100">
                <PaginationBar
                  currentPage={page}
                  totalPages={data?.totalPages ?? 0}
                  totalCount={total}
                  pageSize={pageSize}
                  itemLabel="certificates"
                  onPageChange={setPage}
                  onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
