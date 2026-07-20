"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { CheckCircle2, ClipboardList } from "lucide-react";
import { PageHeader, Button, EmptyState, useToast, useHasRole } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import {
  EMPLOYMENT_TYPE_OPTIONS,
  EMPLOYMENT_TYPE_LABELS,
  type CreateRequisitionInput,
  type EmploymentType,
  type Requisition,
} from "@/types/recruitment";

// LINE_MANAGER self-service raise endpoint. The gateway sets raisedByEmployeeId
// from the caller's X-Employee-ID (JWT employeeId claim) — never send it here.
const BASE = "/api/v1/recruitment/me/requisitions";

const inputCls =
  "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 disabled:opacity-60";

export function MyRequisitionView() {
  const isLineManager = useHasRole("LINE_MANAGER");
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("PERMANENT");
  const [headcount, setHeadcount] = useState("1");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [targetStartDate, setTargetStartDate] = useState("");
  const [description, setDescription] = useState("");

  const raise = useMutation<Requisition, AxiosError<{ message?: string }>, void>({
    mutationFn: () => {
      // departmentId/positionId are nullable and omitted from this lean self-service
      // form — HR completes them when the requisition reaches their queue.
      const body: CreateRequisitionInput = {
        title: title.trim(),
        departmentId: null,
        positionId: null,
        employmentType,
        // Currency is fixed to KES — the only currency the rest of the product
        // (payroll, payslips, formatMoney) can render. A free currency picker
        // here would be speculative until multi-currency lands product-wide.
        salaryMin: salaryMin.trim() ? { amount: Number(salaryMin), currency: "KES" } : null,
        salaryMax: salaryMax.trim() ? { amount: Number(salaryMax), currency: "KES" } : null,
        headcount: headcount.trim() ? Number(headcount) : null,
        targetStartDate: targetStartDate || null,
        description: description.trim() || null,
      };
      return apiClient.post<Requisition>(BASE, body).then((r) => r.data);
    },
    onError: (err) =>
      toast(err.response?.data?.message ?? "Could not raise requisition.", "error"),
  });

  function resetForm() {
    setTitle("");
    setEmploymentType("PERMANENT");
    setHeadcount("1");
    setSalaryMin("");
    setSalaryMax("");
    setTargetStartDate("");
    setDescription("");
    raise.reset();
  }

  const canSubmit = title.trim().length > 0 && !raise.isPending;

  if (!isLineManager) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <PageHeader title="Raise a requisition" subtitle="Request a new hire for your team" />
        <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8">
          <EmptyState
            icon={ClipboardList}
            title="Not available"
            description="Raising requisitions is available to line managers only."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Raise a requisition" subtitle="Request a new hire for your team" />

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8">
        {raise.isSuccess ? (
          <div className="max-w-lg mx-auto bg-white border border-neutral-200 rounded-xl px-8 py-10 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-success-bg mb-4">
              <CheckCircle2 size={24} className="text-success" aria-hidden="true" />
            </div>
            <h2 className="text-[16px] font-bold text-near-black">Requisition sent to HR</h2>
            <p className="mt-2 text-[13.5px] text-neutral-500">
              Your request for {raise.data.headcount} × {raise.data.title} is now with HR for
              review. You will be notified when it is opened as a job posting.
            </p>
            <div className="mt-6">
              <Button variant="primary" onClick={resetForm}>
                Raise another
              </Button>
            </div>
          </div>
        ) : (
          <div className="max-w-lg mx-auto bg-white border border-neutral-200 rounded-xl px-6 py-6 space-y-3">
            <div>
              <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Title</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={inputCls}
                disabled={raise.isPending}
                placeholder="e.g. Senior accountant"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
                  Employment type
                </label>
                <select
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                  className={inputCls}
                  disabled={raise.isPending}
                >
                  {EMPLOYMENT_TYPE_OPTIONS.map((t) => (
                    <option key={t} value={t}>
                      {EMPLOYMENT_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
                  Headcount
                </label>
                <input
                  type="number"
                  min={1}
                  value={headcount}
                  onChange={(e) => setHeadcount(e.target.value)}
                  className={inputCls}
                  disabled={raise.isPending}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
                  Salary min (KES)
                </label>
                <input
                  type="number"
                  min={0}
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value)}
                  className={inputCls}
                  disabled={raise.isPending}
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
                  Salary max (KES)
                </label>
                <input
                  type="number"
                  min={0}
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value)}
                  className={inputCls}
                  disabled={raise.isPending}
                  placeholder="Optional"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
                Target start date
              </label>
              <input
                type="date"
                value={targetStartDate}
                onChange={(e) => setTargetStartDate(e.target.value)}
                className={inputCls}
                disabled={raise.isPending}
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className={`${inputCls} resize-none`}
                disabled={raise.isPending}
                placeholder="What is this role for? Optional."
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="primary" onClick={() => raise.mutate()} disabled={!canSubmit}>
                {raise.isPending ? "Sending…" : "Send to HR"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
