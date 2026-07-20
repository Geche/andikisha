"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Plus } from "lucide-react";
import {
  PageHeader, Button, Badge, BaseModal, DataTable, EmptyState, PermissionGate, useToast, formatMoney,
} from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { ListErrorState } from "@/components/ListErrorState";
import { useRequisitions, recruitmentKeys } from "@/hooks/useRecruitment";
import {
  EMPLOYMENT_TYPE_OPTIONS,
  EMPLOYMENT_TYPE_LABELS,
  requisitionBadgeStatus,
  type CreateRequisitionInput,
  type EmploymentType,
  type Money,
  type Requisition,
} from "@/types/recruitment";

const BASE = "/api/v1/recruitment/requisitions";

interface NamedRef {
  id: string;
  name?: string;
  title?: string;
}

function useNameMap(endpoint: string, key: string) {
  return useQuery<Map<string, string>>({
    queryKey: ["recruitment-refs", key],
    queryFn: async () => {
      const res = await apiClient.get<NamedRef[]>(endpoint);
      const map = new Map<string, string>();
      for (const r of res.data) map.set(r.id, r.name ?? r.title ?? r.id);
      return map;
    },
    staleTime: 60_000,
  });
}

function salaryRange(min: Money | null, max: Money | null): string {
  if (!min && !max) return "—";
  const currency = min?.currency ?? max?.currency ?? "KES";
  if (min && max) return `${formatMoney(min.amount, currency, false)} – ${formatMoney(max.amount, currency, false).replace(`${currency} `, "")}`;
  const only = (min ?? max)!;
  return formatMoney(only.amount, currency, false);
}

export function RequisitionsView() {
  const { data, isLoading, isError, error, refetch } = useRequisitions();
  const deptNames = useNameMap("/api/v1/departments", "departments");
  const positionNames = useNameMap("/api/v1/positions", "positions");
  const [createOpen, setCreateOpen] = useState(false);

  const requisitions = data ?? [];

  const columns = [
    { key: "title", label: "Title" },
    { key: "department", label: "Department" },
    { key: "type", label: "Employment type" },
    { key: "headcount", label: "Headcount", align: "right" as const },
    { key: "salary", label: "Salary range", align: "right" as const },
    { key: "status", label: "Status" },
  ];

  const rows = requisitions.map((r) => ({
    title: <span className="font-medium text-near-black">{r.title}</span>,
    department: r.departmentId ? (deptNames.data?.get(r.departmentId) ?? "—") : "—",
    type: EMPLOYMENT_TYPE_LABELS[r.employmentType],
    headcount: r.headcount,
    salary: salaryRange(r.salaryMin, r.salaryMax),
    status: <Badge status={requisitionBadgeStatus(r.status)}>{r.status}</Badge>,
  }));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Requisitions"
        subtitle={isLoading ? "Loading…" : `${requisitions.length} requisition${requisitions.length === 1 ? "" : "s"}`}
        actions={
          <PermissionGate anyOf={["ADMIN", "HR_MANAGER"]}>
            <Button variant="cta" onClick={() => setCreateOpen(true)}>
              <Plus size={15} aria-hidden="true" />
              New requisition
            </Button>
          </PermissionGate>
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
        {isError ? (
          <ListErrorState error={error} noun="requisitions" onRetry={() => void refetch()} />
        ) : !isLoading && requisitions.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="No requisitions yet"
            description="Raise a requisition to start a hire request, then publish it as a job posting."
          />
        ) : (
          <DataTable columns={columns} rows={rows} isLoading={isLoading} emptyMessage="No requisitions" />
        )}
      </div>

      {createOpen && (
        <RequisitionFormModal
          departmentOptions={deptNames.data}
          positionOptions={positionNames.data}
          onClose={() => setCreateOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Create modal ────────────────────────────────────────────────────────────

const inputCls =
  "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900";

function RequisitionFormModal({
  departmentOptions,
  positionOptions,
  onClose,
}: {
  departmentOptions?: Map<string, string>;
  positionOptions?: Map<string, string>;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [title, setTitle] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [positionId, setPositionId] = useState("");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("PERMANENT");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [headcount, setHeadcount] = useState("1");
  const [targetStartDate, setTargetStartDate] = useState("");
  const [description, setDescription] = useState("");

  const create = useMutation<Requisition, AxiosError<{ message?: string }>, void>({
    mutationFn: () => {
      const body: CreateRequisitionInput = {
        title: title.trim(),
        departmentId: departmentId || null,
        positionId: positionId || null,
        employmentType,
        // Currency fixed to KES — see MyRequisitionView; no other money surface
        // renders anything else yet.
        salaryMin: salaryMin.trim() ? { amount: Number(salaryMin), currency: "KES" } : null,
        salaryMax: salaryMax.trim() ? { amount: Number(salaryMax), currency: "KES" } : null,
        headcount: headcount.trim() ? Number(headcount) : null,
        targetStartDate: targetStartDate || null,
        description: description.trim() || null,
      };
      return apiClient.post<Requisition>(BASE, body).then((r) => r.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recruitmentKeys.requisitions });
      toast("Requisition created", "success");
      onClose();
    },
    onError: (err) => toast(err.response?.data?.message ?? "Could not create requisition.", "error"),
  });

  const canSave = title.trim().length > 0;

  return (
    <BaseModal labelId="requisition-title" onClose={onClose} maxWidth="max-w-lg">
      <h2 id="requisition-title" className="text-[16px] font-bold text-near-black mb-4">New requisition</h2>

      <div className="max-h-[70vh] overflow-y-auto pr-1 space-y-3">
        <div>
          <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} disabled={create.isPending} placeholder="e.g. Senior accountant" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Department</label>
            <select value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} className={inputCls} disabled={create.isPending}>
              <option value="">None</option>
              {[...(departmentOptions ?? new Map())].map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Position</label>
            <select value={positionId} onChange={(e) => setPositionId(e.target.value)} className={inputCls} disabled={create.isPending}>
              <option value="">None</option>
              {[...(positionOptions ?? new Map())].map(([id, name]) => (
                <option key={id} value={id}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Employment type</label>
            <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value as EmploymentType)} className={inputCls} disabled={create.isPending}>
              {EMPLOYMENT_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>{EMPLOYMENT_TYPE_LABELS[t]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Headcount</label>
            <input type="number" min={1} value={headcount} onChange={(e) => setHeadcount(e.target.value)} className={inputCls} disabled={create.isPending} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Salary min (KES)</label>
            <input type="number" min={0} value={salaryMin} onChange={(e) => setSalaryMin(e.target.value)} className={inputCls} disabled={create.isPending} placeholder="Optional" />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Salary max (KES)</label>
            <input type="number" min={0} value={salaryMax} onChange={(e) => setSalaryMax(e.target.value)} className={inputCls} disabled={create.isPending} placeholder="Optional" />
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Target start date</label>
          <input type="date" value={targetStartDate} onChange={(e) => setTargetStartDate(e.target.value)} className={inputCls} disabled={create.isPending} />
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${inputCls} resize-none`} disabled={create.isPending} placeholder="Optional" />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-5">
        <Button variant="outline" onClick={onClose} disabled={create.isPending}>Cancel</Button>
        <Button variant="primary" onClick={() => create.mutate()} disabled={!canSave || create.isPending}>
          {create.isPending ? "Creating…" : "Create requisition"}
        </Button>
      </div>
    </BaseModal>
  );
}
