"use client";

import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import {
  Upload, Download, AlertTriangle, CheckCircle2, FileText,
  ArrowLeft, ChevronRight
} from "lucide-react";
import { PageHeader, useToast } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import type { AxiosError } from "axios";
import { useWorkspace } from "@/hooks/useWorkspace";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BulkRowError {
  row: number;
  field: string;
  value: string | null;
  message: string;
}

interface ValidationReport {
  totalRows: number;
  validRows: number;
  errors: BulkRowError[];
  uploadId: string;
}

interface CommitResult {
  createdCount: number;
  employeeIds: string[];
}

// ─── Error table ─────────────────────────────────────────────────────────────

function ErrorTable({ errors }: { errors: BulkRowError[] }) {
  return (
    <div className="overflow-x-auto border border-red-200 rounded-xl">
      <table className="w-full text-[12.5px]">
        <thead className="bg-red-50 text-red-700">
          <tr>
            <th className="text-left px-4 py-2.5 font-semibold">Row</th>
            <th className="text-left px-4 py-2.5 font-semibold">Field</th>
            <th className="text-left px-4 py-2.5 font-semibold">Value</th>
            <th className="text-left px-4 py-2.5 font-semibold">Issue</th>
          </tr>
        </thead>
        <tbody>
          {errors.slice(0, 100).map((e, i) => (
            <tr key={i} className="border-t border-red-100 bg-white hover:bg-red-50 transition-colors">
              <td className="px-4 py-2 text-red-700 font-semibold">{e.row}</td>
              <td className="px-4 py-2 font-mono text-neutral-700">{e.field}</td>
              <td className="px-4 py-2 text-neutral-500 max-w-[180px] truncate">{e.value ?? "—"}</td>
              <td className="px-4 py-2 text-neutral-700">{e.message}</td>
            </tr>
          ))}
          {errors.length > 100 && (
            <tr className="border-t border-red-100 bg-red-50">
              <td colSpan={4} className="px-4 py-2 text-red-600 text-center text-[12px]">
                … and {errors.length - 100} more errors. Download the error report to see all.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function BulkUploadPage() {
  const workspace = useWorkspace();
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [committed, setCommitted] = useState<CommitResult | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const uploadMutation = useMutation<ValidationReport, AxiosError<{ message?: string }>, File>({
    mutationFn: (file) => {
      const form = new FormData();
      form.append("file", file);
      return apiClient
        .post<ValidationReport>("/api/v1/employees/bulk-upload", form, {
          headers: { "Content-Type": "multipart/form-data" },
        })
        .then((r) => r.data);
    },
    onSuccess: (data) => {
      setReport(data);
      setCommitted(null);
    },
    onError: (err) => {
      toast(err.response?.data?.message ?? "Upload failed. Check file format.", "error");
    },
  });

  const commitMutation = useMutation<CommitResult, AxiosError<{ message?: string }>, { uploadId: string; validRowsOnly: boolean }>({
    mutationFn: ({ uploadId, validRowsOnly }) =>
      apiClient
        .post<CommitResult>(`/api/v1/employees/bulk-upload/${uploadId}/commit?validRowsOnly=${validRowsOnly}`)
        .then((r) => r.data),
    onSuccess: (data) => {
      setCommitted(data);
      toast(`${data.createdCount} employee records created`, "success");
    },
    onError: (err) => {
      toast(err.response?.data?.message ?? "Commit failed.", "error");
    },
  });

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setSelectedFile(f);
    setReport(null);
    setCommitted(null);
    uploadMutation.mutate(f);
  }

  function downloadErrorReport() {
    if (!report) return;
    const rows = [
      "Row,Field,Value,Issue",
      ...report.errors.map((e) => `${e.row},"${e.field}","${e.value ?? ""}","${e.message}"`),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "bulk-upload-errors.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  const hasErrors = (report?.errors?.length ?? 0) > 0;
  const isClean   = report && !hasErrors;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Bulk Employee Upload"
        subtitle="Upload a CSV or Excel file to add multiple employees at once"
        actions={
          <Link
            href={`/${workspace}/admin/employees`}
            className="flex items-center gap-1.5 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13px] h-9 px-3.5 rounded-lg transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8 space-y-6">

        {/* Template download */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <p className="text-[13.5px] font-semibold text-neutral-900 mb-1">Step 1 — Download template</p>
          <p className="text-[12.5px] text-neutral-500 mb-4">
            Use the official template to ensure your file matches the expected format.
            Required columns are marked with *.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="/api/proxy/api/v1/employees/bulk-upload/template/xlsx"
              download="employee-upload-template.xlsx"
              className="flex items-center gap-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold text-[13px] h-9 px-4 rounded-lg transition-colors"
            >
              <Download size={13} />
              Excel (.xlsx)
            </a>
            <a
              href="/api/proxy/api/v1/employees/bulk-upload/template/csv"
              download="employee-upload-template.csv"
              className="flex items-center gap-2 border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-semibold text-[13px] h-9 px-4 rounded-lg transition-colors"
            >
              <FileText size={13} />
              CSV
            </a>
          </div>
        </div>

        {/* Upload dropzone */}
        <div className="bg-white border border-neutral-200 rounded-xl p-6">
          <p className="text-[13.5px] font-semibold text-neutral-900 mb-1">Step 2 — Upload your file</p>
          <p className="text-[12.5px] text-neutral-500 mb-4">
            The entire file is validated before any records are created.
          </p>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploadMutation.isPending}
            className="w-full border-2 border-dashed border-neutral-200 hover:border-brand-300 rounded-xl p-10 flex flex-col items-center gap-3 transition-colors disabled:opacity-60"
          >
            <Upload size={28} className="text-neutral-400" />
            <span className="text-[13.5px] font-semibold text-neutral-700">
              {uploadMutation.isPending
                ? "Validating…"
                : selectedFile
                ? selectedFile.name
                : "Click to select file (CSV or Excel)"}
            </span>
            <span className="text-[11.5px] text-neutral-400">Max 10 MB</span>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Validation report */}
        {report && !committed && (
          <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <p className="text-[13.5px] font-semibold text-neutral-900">Validation Report</p>
              <div className="flex items-center gap-4 text-[12.5px]">
                <span className="text-neutral-500">Total rows: <strong className="text-neutral-900">{report.totalRows}</strong></span>
                <span className="text-brand-700">Valid: <strong>{report.validRows}</strong></span>
                {hasErrors && <span className="text-red-600">Errors: <strong>{report.errors.length}</strong></span>}
              </div>
            </div>

            {isClean && (
              <div className="flex items-center gap-2.5 bg-green-50 border border-green-200 rounded-xl px-5 py-3.5 text-[13px] text-green-700">
                <CheckCircle2 size={16} className="flex-shrink-0" />
                All {report.validRows} rows passed validation. Ready to commit.
              </div>
            )}

            {hasErrors && (
              <>
                <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
                  <AlertTriangle size={15} className="flex-shrink-0" />
                  <span className="flex-1">
                    {report.errors.length} error{report.errors.length !== 1 ? "s" : ""} found.
                    {report.validRows > 0 && ` ${report.validRows} rows are valid.`}
                  </span>
                </div>
                <ErrorTable errors={report.errors} />
              </>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              {hasErrors && (
                <button
                  onClick={downloadErrorReport}
                  className="flex items-center gap-1.5 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13px] h-9 px-4 rounded-lg transition-colors"
                >
                  <Download size={13} />
                  Download error report
                </button>
              )}
              <button
                onClick={() => { fileRef.current?.click(); }}
                className="flex items-center gap-1.5 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13px] h-9 px-4 rounded-lg transition-colors"
              >
                Fix and re-upload
              </button>

              {report.validRows > 0 && (
                <>
                  {hasErrors && (
                    <button
                      onClick={() => commitMutation.mutate({ uploadId: report.uploadId, validRowsOnly: true })}
                      disabled={commitMutation.isPending}
                      className="flex items-center gap-1.5 border border-amber text-amber-text bg-amber-light hover:bg-amber/20 font-semibold text-[13px] h-9 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Proceed with {report.validRows} valid rows only
                    </button>
                  )}
                  {isClean && (
                    <button
                      onClick={() => commitMutation.mutate({ uploadId: report.uploadId, validRowsOnly: false })}
                      disabled={commitMutation.isPending}
                      className="flex items-center gap-2 bg-brand-900 hover:bg-brand-950 disabled:opacity-50 text-white font-bold text-[13.5px] h-9 px-5 rounded-lg transition-colors"
                    >
                      {commitMutation.isPending ? "Creating records…" : `Proceed with all ${report.validRows} rows`}
                      <ChevronRight size={14} />
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Commit success */}
        {committed && (
          <div className="bg-white border border-brand-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={22} className="text-brand-700 flex-shrink-0" />
              <div>
                <p className="text-[15px] font-bold text-near-black">
                  {committed.createdCount} employee records created
                </p>
                <p className="text-[12.5px] text-neutral-500 mt-0.5">
                  No user accounts have been created yet. Activate accounts from the pending activation page.
                </p>
              </div>
            </div>
            <Link
              href={`/${workspace}/admin/employees/pending-activation`}
              className="inline-flex items-center gap-2 bg-brand-900 hover:bg-brand-950 text-white font-bold text-[13.5px] h-9 px-5 rounded-lg transition-colors"
            >
              Go to Pending Activation
              <ChevronRight size={14} />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
