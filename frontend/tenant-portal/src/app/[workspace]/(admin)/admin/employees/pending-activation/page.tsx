"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, AlertTriangle, Download, UserX } from "lucide-react";
import { PageHeader, BaseModal, useToast } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import type { AxiosError } from "axios";
import { useWorkspace } from "@/hooks/useWorkspace";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PendingEmployee {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string;
  departmentName: string | null;
  positionTitle: string | null;
}

interface ActivationResult {
  employeeId: string;
  employeeName: string;
  email: string | null;
  tempPassword: string | null;
  success: boolean;
  errorCode: string | null;   // machine-readable, e.g. "USER_ALREADY_ACTIVATED"
  errorMessage: string | null;
}

// ─── Activation result modal ──────────────────────────────────────────────────

function ActivationResultModal({
  results,
  onClose,
}: {
  results: ActivationResult[];
  onClose: () => void;
}) {
  const workspace = useWorkspace();
  const [copied, setCopied] = useState(false);

  const successful      = results.filter((r) => r.success);
  const alreadyActive   = results.filter((r) => !r.success && r.errorCode === "USER_ALREADY_ACTIVATED");
  const otherFailed     = results.filter((r) => !r.success && r.errorCode !== "USER_ALREADY_ACTIVATED");

  function downloadPasswords() {
    const rows = [
      "Name,Email,Temporary Password",
      ...successful.map((r) => `"${r.employeeName}","${r.email ?? ""}","${r.tempPassword ?? ""}"`),
    ].join("\n");
    const blob = new Blob([rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "activation-passwords.csv"; a.click();
    URL.revokeObjectURL(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <BaseModal labelId="activation-result-title" onClose={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-[620px] max-h-[85vh] flex flex-col">
        <div className="px-6 py-5 border-b border-neutral-100">
          <h2 id="activation-result-title" className="text-[16px] font-bold text-neutral-900">
            Activation Complete
          </h2>
          <p className="text-[13px] text-neutral-500 mt-0.5">
            {successful.length} activated
            {alreadyActive.length > 0 && `, ${alreadyActive.length} already active`}
            {otherFailed.length > 0 && `, ${otherFailed.length} failed`}
          </p>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* ── Successful activations ── */}
          {successful.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-start gap-2.5 rounded-xl bg-amber-light border border-amber px-4 py-3">
                <AlertTriangle size={14} className="text-amber flex-shrink-0 mt-0.5" />
                <p className="text-[12.5px] text-amber-text leading-relaxed">
                  Share these passwords directly with each employee. They are required to change their password on first login. Download the list and store it securely.
                </p>
              </div>

              <div className="border border-neutral-200 rounded-xl overflow-hidden">
                <table className="w-full text-[12.5px]">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="text-left px-4 py-2.5 font-semibold text-neutral-600">Employee</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-neutral-600">Email</th>
                      <th className="text-left px-4 py-2.5 font-semibold text-neutral-600">Temp Password</th>
                    </tr>
                  </thead>
                  <tbody>
                    {successful.map((r) => (
                      <tr key={r.employeeId} className="border-t border-neutral-100">
                        <td className="px-4 py-2 font-medium text-near-black">{r.employeeName}</td>
                        <td className="px-4 py-2 text-neutral-600">{r.email}</td>
                        <td className="px-4 py-2 font-mono text-[13px] font-semibold text-brand-900">{r.tempPassword}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Already-active employees — actionable, not an error ── */}
          {alreadyActive.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-[12.5px] font-semibold text-neutral-700">
                <UserX size={14} className="text-amber flex-shrink-0" />
                {alreadyActive.length === 1
                  ? "1 employee already has an account"
                  : `${alreadyActive.length} employees already have accounts`}
              </div>
              <div className="text-[12px] text-neutral-500 mb-2">
                These employees already have active login accounts. Use the password reset action on their profile to issue new credentials.
              </div>
              <div className="space-y-1.5">
                {alreadyActive.map((r) => (
                  <div
                    key={r.employeeId}
                    className="flex items-center justify-between bg-neutral-50 border border-neutral-200 rounded-lg px-4 py-2.5"
                  >
                    <div>
                      <span className="text-[13px] font-medium text-near-black">{r.employeeName}</span>
                      {r.email && (
                        <span className="text-[12px] text-neutral-500 ml-2">{r.email}</span>
                      )}
                    </div>
                    <Link
                      href={`/${workspace}/admin/employees/${r.employeeId}`}
                      onClick={onClose}
                      className="text-[12px] font-semibold text-brand-700 hover:text-brand-900 transition-colors whitespace-nowrap ml-4"
                    >
                      Open profile →
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Other failures ── */}
          {otherFailed.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[12px] font-semibold text-red-600">
                {otherFailed.length} activation{otherFailed.length !== 1 ? "s" : ""} failed:
              </p>
              {otherFailed.map((r) => (
                <div key={r.employeeId} className="text-[12px] text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                  {r.employeeName}: {r.errorMessage}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-neutral-100 flex items-center gap-3">
          {successful.length > 0 && (
            <button
              onClick={downloadPasswords}
              className="flex items-center gap-2 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-semibold text-[13px] h-9 px-4 rounded-lg transition-colors"
            >
              <Download size={13} />
              {copied ? "Downloaded!" : "Download passwords CSV"}
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13.5px] px-6 py-2.5 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PendingActivationPage() {
  const workspace = useWorkspace();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [activationResults, setActivationResults] = useState<ActivationResult[] | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const { data: employees = [], isLoading, isError } = useQuery<PendingEmployee[]>({
    queryKey: ["pending-activation"],
    queryFn: () =>
      apiClient
        .get<PendingEmployee[]>("/api/v1/employees/bulk-upload/pending-activation")
        .then((r) => r.data),
    staleTime: 30_000,
  });

  const activateMutation = useMutation<ActivationResult[], AxiosError, string[]>({
    mutationFn: (ids) =>
      apiClient
        .post<ActivationResult[]>("/api/v1/employees/bulk-upload/activate", ids)
        .then((r) => r.data),
    onSuccess: (results) => {
      setActivationResults(results);
      setSelected(new Set());
      setShowConfirm(false);
      void queryClient.invalidateQueries({ queryKey: ["pending-activation"] });
    },
    onError: () => {
      toast("Activation failed. Please try again.", "error");
      setShowConfirm(false);
    },
  });

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function toggleAll() {
    if (selected.size === employees.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(employees.map((e) => e.id)));
    }
  }

  const selectedList = [...selected];
  const selectedCount = selectedList.length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Pending Activation"
        subtitle="Employees with records but no login account. Select and activate to create their accounts."
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

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8">
        {isError && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700 mb-5">
            <AlertTriangle size={15} className="flex-shrink-0" />
            Could not load pending employees.
          </div>
        )}

        {!isLoading && employees.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <CheckCircle2 size={40} className="text-brand-600 mb-4" />
            <p className="text-[16px] font-semibold text-neutral-800">All employees have accounts</p>
            <p className="text-[13px] text-neutral-500 mt-1">No bulk-uploaded employees are awaiting activation.</p>
            <Link
              href={`/${workspace}/admin/employees/bulk-upload`}
              className="mt-6 flex items-center gap-2 bg-brand-900 hover:bg-brand-950 text-white font-bold text-[13.5px] h-9 px-5 rounded-lg transition-colors"
            >
              Upload more employees
            </Link>
          </div>
        )}

        {employees.length > 0 && (
          <>
            {/* Activation bar */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-[13px] text-neutral-600">
                {selectedCount > 0
                  ? `${selectedCount} selected`
                  : `${employees.length} employee${employees.length !== 1 ? "s" : ""} pending`}
              </p>
              {selectedCount > 0 && (
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={activateMutation.isPending}
                  className="flex items-center gap-2 bg-brand-900 hover:bg-brand-950 disabled:opacity-50 text-white font-bold text-[13.5px] h-9 px-5 rounded-lg transition-colors"
                >
                  {activateMutation.isPending ? "Activating…" : `Activate ${selectedCount} account${selectedCount !== 1 ? "s" : ""}`}
                </button>
              )}
            </div>

            {/* Table */}
            <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
              <table className="w-full text-[13px]">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-5 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selected.size === employees.length && employees.length > 0}
                        onChange={toggleAll}
                        className="accent-brand-900"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">#</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Name</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Email</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Department</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Position</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr
                      key={emp.id}
                      onClick={() => toggleSelect(emp.id)}
                      className={`border-t border-neutral-100 cursor-pointer transition-colors ${
                        selected.has(emp.id) ? "bg-brand-50" : "hover:bg-neutral-50"
                      }`}
                    >
                      <td className="px-5 py-3">
                        <input
                          type="checkbox"
                          checked={selected.has(emp.id)}
                          onChange={() => toggleSelect(emp.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="accent-brand-900"
                        />
                      </td>
                      <td className="px-4 py-3 font-mono text-[12px] text-neutral-500">{emp.employeeNumber}</td>
                      <td className="px-4 py-3 font-medium text-near-black">{emp.firstName} {emp.lastName}</td>
                      <td className="px-4 py-3 text-neutral-600">{emp.email ?? "—"}</td>
                      <td className="px-4 py-3 text-neutral-600">{emp.departmentName ?? "—"}</td>
                      <td className="px-4 py-3 text-neutral-600">{emp.positionTitle ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Confirmation modal */}
      {showConfirm && (
        <BaseModal labelId="activate-confirm-title" onClose={() => setShowConfirm(false)}>
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-[420px] p-6 flex flex-col gap-4">
            <h2 id="activate-confirm-title" className="text-[16px] font-bold text-neutral-900">
              Activate {selectedCount} account{selectedCount !== 1 ? "s" : ""}?
            </h2>
            <p className="text-[13px] text-neutral-600">
              Temporary passwords will be generated and welcome emails queued for each employee.
              You will see the passwords on the next screen — share them securely.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13.5px] py-2.5 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => activateMutation.mutate(selectedList)}
                disabled={activateMutation.isPending}
                className="flex-1 bg-brand-900 hover:bg-brand-950 disabled:opacity-50 text-white font-bold text-[13.5px] py-2.5 rounded-lg transition-colors"
              >
                {activateMutation.isPending ? "Activating…" : "Confirm"}
              </button>
            </div>
          </div>
        </BaseModal>
      )}

      {/* Activation result modal */}
      {activationResults && (
        <ActivationResultModal
          results={activationResults}
          onClose={() => setActivationResults(null)}
        />
      )}
    </div>
  );
}
