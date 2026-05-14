"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader, useToast } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import type { AxiosError } from "axios";

// ─── Types ───────────────────────────────────────────────────────────────────

type PayFrequency = "MONTHLY" | "WEEKLY" | "BIWEEKLY";

interface InitiateRunRequest {
  period: string;
  payFrequency: PayFrequency;
}

interface PayrollRun {
  id: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const MONTHS = [
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
] as const;

function getYearOptions(): number[] {
  const current = new Date().getFullYear();
  return [current, current - 1, current - 2];
}

const selectCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-[13.5px] text-[#02110C] focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] bg-white";

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NewPayrollRunPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();

  const now = new Date();
  const currentMonth = String(now.getMonth() + 1).padStart(2, "0");
  const currentYear = now.getFullYear();

  const [month, setMonth] = useState(currentMonth);
  const [year, setYear] = useState(String(currentYear));
  const [payFrequency, setPayFrequency] = useState<PayFrequency>("MONTHLY");

  const mutation = useMutation<PayrollRun, AxiosError<{ message?: string }>, InitiateRunRequest>({
    mutationFn: (body) =>
      apiClient.post<PayrollRun>("/api/v1/payroll/runs", body).then((r) => r.data),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
      toast("Payroll run initiated — calculation in progress", "success");
      router.push(`/payroll/${data.id}`);
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ?? "Failed to initiate payroll run. Please try again.";
      toast(msg, "error");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const period = `${year}-${month}`;
    mutation.mutate({ period, payFrequency });
  }

  const isPending = mutation.isPending;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Run Payroll"
        subtitle="Initiate a new payroll calculation"
        actions={
          <Link
            href="/admin/payroll"
            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-[13px] h-9 px-3.5 rounded-lg transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-8 flex justify-center">
        <form onSubmit={handleSubmit} noValidate className="w-full max-w-md">
          <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col gap-6">

            {/* Pay Period */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                Pay Period <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  disabled={isPending}
                  className={selectCls}
                >
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <select
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  disabled={isPending}
                  className={`${selectCls} w-28 flex-shrink-0`}
                >
                  {getYearOptions().map((y) => (
                    <option key={y} value={String(y)}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pay Frequency */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
                Pay Frequency <span className="text-red-500">*</span>
              </label>
              <select
                value={payFrequency}
                onChange={(e) => setPayFrequency(e.target.value as PayFrequency)}
                disabled={isPending}
                className={selectCls}
              >
                <option value="MONTHLY">Monthly</option>
                <option value="WEEKLY">Weekly</option>
                <option value="BIWEEKLY">Bi-weekly</option>
              </select>
            </div>

            {/* Info block */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3.5 text-[12.5px] text-gray-500 leading-relaxed">
              This will calculate PAYE, NSSF, SHIF, and Housing Levy for all active employees in
              the selected period.
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#E8A020] hover:bg-[#C98510] disabled:opacity-60 disabled:cursor-not-allowed text-[#02110C] font-bold text-[14px] py-3 rounded-lg transition-colors"
            >
              {isPending ? "Initiating…" : "Initiate Payroll Run"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
