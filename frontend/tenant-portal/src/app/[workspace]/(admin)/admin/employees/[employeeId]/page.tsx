"use client";

import { use, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { ArrowLeft, AlertTriangle, ChevronDown, Pencil, Lock, ShieldCheck, KeyRound } from "lucide-react";
import { PageHeader, BaseModal, useToast, useCurrentUser } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import type { AxiosError } from "axios";
import { useWorkspace } from "@/hooks/useWorkspace";

// ─── Types ───────────────────────────────────────────────────────────────────

type EmployeeStatus = "ACTIVE" | "TERMINATED" | "ON_LEAVE" | "ON_PROBATION";

interface EmployeeDetail {
  id: string;
  tenantId: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string;
  nationalId: string;
  kraPin: string;
  nhifNumber: string | null;
  nssfNumber: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  departmentId: string | null;
  departmentName: string | null;
  positionId: string | null;
  positionTitle: string | null;
  employmentType: string;
  status: EmployeeStatus;
  basicSalary: number;
  housingAllowance: number;
  transportAllowance: number;
  medicalAllowance: number;
  otherAllowances: number;
  helbMonthlyDeduction: number;
  grossPay: number;
  currency: string;
  hireDate: string | null;
  probationEndDate: string | null;
  terminationDate: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  createdAt: string;
}

interface DeptOption { id: string; name: string; }
interface PosOption  { id: string; title: string; }

interface UserAccount {
  id: string;
  email: string;
  role: string;
  active: boolean;
}

// Roles assignable by ADMIN (no SUPER_ADMIN, no ADMIN — must not enable self-elevation)
const ASSIGNABLE_ROLES = [
  { value: "EMPLOYEE",        label: "Employee" },
  { value: "HR_OFFICER",      label: "HR Officer" },
  { value: "PAYROLL_OFFICER", label: "Payroll Officer" },
  { value: "HR_MANAGER",      label: "HR Manager" },
  { value: "LINE_MANAGER",    label: "Line Manager" },
] as const;

function roleLabel(role: string): string {
  return ASSIGNABLE_ROLES.find((r) => r.value === role)?.label ?? role;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatKES(amount: number): string {
  return "KES " + amount.toLocaleString("en-KE", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function statusBadgeClass(status: EmployeeStatus): string {
  switch (status) {
    case "ACTIVE":       return "bg-brand-100 text-brand-800";
    case "TERMINATED":   return "bg-neutral-100 text-neutral-500";
    case "ON_LEAVE":     return "bg-amber-light text-amber-text";
    case "ON_PROBATION": return "bg-blue-50 text-blue-700";
  }
}

function statusLabel(status: EmployeeStatus): string {
  switch (status) {
    case "ON_PROBATION": return "Probation";
    case "ON_LEAVE":     return "On Leave";
    case "TERMINATED":   return "Terminated";
    case "ACTIVE":       return "Active";
  }
}

// ─── Shared form primitives ───────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
      {children}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
  );
}

const inputCls = "w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 placeholder:text-neutral-300 disabled:bg-neutral-50 disabled:text-neutral-400 disabled:cursor-not-allowed";

function LockedField({ label, value, reason }: { label: string; value: string; reason: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-1.5">
        <span className="text-[12px] font-semibold text-neutral-600">{label}</span>
        <span className="flex items-center gap-1 text-[10.5px] text-amber-text bg-amber-light px-1.5 py-0.5 rounded-full font-semibold">
          <Lock size={9} />
          {reason}
        </span>
      </div>
      <input type="text" value={value} disabled className={inputCls} />
    </div>
  );
}

// ─── Card + Row ──────────────────────────────────────────────────────────────

function InfoCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-brand-700">{title}</p>
        {action}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-[12.5px] text-neutral-500 flex-shrink-0 w-40">{label}</p>
      <p className="text-[13px] font-medium text-near-black text-right">{value ?? "—"}</p>
    </div>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function DetailSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-5 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="bg-white border border-neutral-200 rounded-xl p-6">
          <div className="h-3 bg-neutral-100 rounded w-32 mb-4" />
          {Array.from({ length: 3 }).map((_, j) => (
            <div key={j} className="flex justify-between mb-3">
              <div className="h-3 bg-neutral-100 rounded w-24" />
              <div className="h-3 bg-neutral-100 rounded w-28" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Edit Employee Modal ──────────────────────────────────────────────────────

interface EditEmployeeModalProps {
  employee: EmployeeDetail;
  hasPayslips: boolean;
  onClose: () => void;
}

function EditEmployeeModal({ employee, hasPayslips, onClose }: EditEmployeeModalProps) {
  const [form, setForm] = useState({
    firstName:         employee.firstName,
    lastName:          employee.lastName,
    email:             employee.email ?? "",
    phoneNumber:       employee.phoneNumber,
    dateOfBirth:       employee.dateOfBirth ?? "",
    gender:            employee.gender ?? "",
    departmentId:      employee.departmentId ?? "",
    positionId:        employee.positionId ?? "",
    bankName:          employee.bankName ?? "",
    bankAccountNumber: employee.bankAccountNumber ?? "",
    kraPin:            employee.kraPin,
    nhifNumber:        employee.nhifNumber ?? "",
    nssfNumber:        employee.nssfNumber ?? "",
  });

  const queryClient = useQueryClient();
  const toast = useToast();

  const { data: departments = [] } = useQuery<DeptOption[]>({
    queryKey: ["departments"],
    queryFn: () => apiClient.get<DeptOption[]>("/api/v1/departments").then((r) => r.data),
  });

  const { data: positions = [] } = useQuery<PosOption[]>({
    queryKey: ["positions"],
    queryFn: () => apiClient.get<PosOption[]>("/api/v1/positions").then((r) => r.data),
  });

  const mutation = useMutation<EmployeeDetail, AxiosError<{ message?: string }>, typeof form>({
    mutationFn: (body) =>
      apiClient.put<EmployeeDetail>(`/api/v1/employees/${employee.id}`, {
        ...body,
        departmentId: body.departmentId || undefined,
        positionId:   body.positionId   || undefined,
        dateOfBirth:  body.dateOfBirth  || undefined,
        gender:       body.gender       || undefined,
        email:        body.email        || undefined,
        bankName:     body.bankName     || undefined,
        bankAccountNumber: body.bankAccountNumber || undefined,
        kraPin:       hasPayslips ? undefined : (body.kraPin   || undefined),
        nhifNumber:   hasPayslips ? undefined : (body.nhifNumber  || undefined),
        nssfNumber:   hasPayslips ? undefined : (body.nssfNumber  || undefined),
      }).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["employee", employee.id] });
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast("Employee updated", "success");
      onClose();
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? "Failed to update employee. Please try again.";
      toast(msg, "error");
    },
  });

  const set = (field: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [field]: e.target.value }));

  return (
    <BaseModal labelId="edit-employee-modal-title" onClose={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-[640px] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex-shrink-0">
          <h2 id="edit-employee-modal-title" className="text-[16px] font-bold text-neutral-900">
            Edit Employee
          </h2>
          <p className="text-[13px] text-neutral-500 mt-0.5">
            {employee.firstName} {employee.lastName} · #{employee.employeeNumber}
          </p>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5 flex flex-col gap-6">
          {/* Personal Information */}
          <section>
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand-700 mb-3">
              Personal Information
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel required>First Name</FieldLabel>
                <input type="text" value={form.firstName} onChange={set("firstName")} disabled={mutation.isPending} className={inputCls} />
              </div>
              <div>
                <FieldLabel required>Last Name</FieldLabel>
                <input type="text" value={form.lastName} onChange={set("lastName")} disabled={mutation.isPending} className={inputCls} />
              </div>
              <div>
                <FieldLabel>Email</FieldLabel>
                <input type="email" value={form.email} onChange={set("email")} disabled={mutation.isPending} className={inputCls} placeholder="name@company.co.ke" />
              </div>
              <div>
                <FieldLabel required>Phone Number</FieldLabel>
                <input type="tel" value={form.phoneNumber} onChange={set("phoneNumber")} disabled={mutation.isPending} className={inputCls} placeholder="+254712345678" />
              </div>
              <div>
                <FieldLabel>Date of Birth</FieldLabel>
                <input type="date" value={form.dateOfBirth} onChange={set("dateOfBirth")} disabled={mutation.isPending} className={inputCls} />
              </div>
              <div>
                <FieldLabel>Gender</FieldLabel>
                <select value={form.gender} onChange={set("gender")} disabled={mutation.isPending} className={inputCls}>
                  <option value="">— Select —</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                  <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                </select>
              </div>
            </div>
          </section>

          {/* Employment */}
          <section>
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand-700 mb-3">
              Employment
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Department</FieldLabel>
                <select value={form.departmentId} onChange={set("departmentId")} disabled={mutation.isPending} className={inputCls}>
                  <option value="">— No department —</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <FieldLabel>Position</FieldLabel>
                <select value={form.positionId} onChange={set("positionId")} disabled={mutation.isPending} className={inputCls}>
                  <option value="">— No position —</option>
                  {positions.map((p) => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Bank Details */}
          <section>
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand-700 mb-3">
              Bank Details
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <FieldLabel>Bank Name</FieldLabel>
                <input type="text" value={form.bankName} onChange={set("bankName")} disabled={mutation.isPending} className={inputCls} placeholder="e.g. Equity Bank" />
              </div>
              <div>
                <FieldLabel>Account Number</FieldLabel>
                <input type="text" value={form.bankAccountNumber} onChange={set("bankAccountNumber")} disabled={mutation.isPending} className={inputCls} placeholder="e.g. 0123456789" />
              </div>
            </div>
          </section>

          {/* Statutory Numbers */}
          <section>
            <p className="text-[11px] font-bold uppercase tracking-widest text-brand-700 mb-3">
              Statutory Numbers
            </p>
            {hasPayslips ? (
              <div className="grid grid-cols-2 gap-4">
                <LockedField label="KRA PIN" value={form.kraPin} reason="Locked after first payroll" />
                <LockedField label="NHIF / SHIF Number" value={form.nhifNumber} reason="Locked after first payroll" />
                <LockedField label="NSSF Number" value={form.nssfNumber} reason="Locked after first payroll" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <FieldLabel>KRA PIN</FieldLabel>
                  <input type="text" value={form.kraPin} onChange={set("kraPin")} disabled={mutation.isPending} className={inputCls} placeholder="A123456789X" />
                </div>
                <div>
                  <FieldLabel>NHIF / SHIF Number</FieldLabel>
                  <input type="text" value={form.nhifNumber} onChange={set("nhifNumber")} disabled={mutation.isPending} className={inputCls} />
                </div>
                <div>
                  <FieldLabel>NSSF Number</FieldLabel>
                  <input type="text" value={form.nssfNumber} onChange={set("nssfNumber")} disabled={mutation.isPending} className={inputCls} />
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 flex items-center gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="flex-1 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13.5px] py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!form.firstName.trim() || !form.lastName.trim() || mutation.isPending}
            onClick={() => mutation.mutate(form)}
            className="flex-1 bg-brand-900 hover:bg-brand-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[13.5px] py-2.5 rounded-lg transition-colors"
          >
            {mutation.isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

// ─── Salary Modal ─────────────────────────────────────────────────────────────

interface SalaryModalProps {
  employee: EmployeeDetail;
  onClose: () => void;
}

function SalaryModal({ employee, onClose }: SalaryModalProps) {
  const [form, setForm] = useState({
    basicSalary:         String(employee.basicSalary),
    housingAllowance:    String(employee.housingAllowance),
    transportAllowance:  String(employee.transportAllowance),
    medicalAllowance:    String(employee.medicalAllowance),
    otherAllowances:     String(employee.otherAllowances),
    helbMonthlyDeduction: String(employee.helbMonthlyDeduction),
  });

  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation<EmployeeDetail, AxiosError<{ message?: string }>, typeof form>({
    mutationFn: (body) =>
      apiClient
        .put<EmployeeDetail>(`/api/v1/employees/${employee.id}/salary`, {
          basicSalary:          parseFloat(body.basicSalary)         || 0,
          housingAllowance:     parseFloat(body.housingAllowance)    || 0,
          transportAllowance:   parseFloat(body.transportAllowance)  || 0,
          medicalAllowance:     parseFloat(body.medicalAllowance)    || 0,
          otherAllowances:      parseFloat(body.otherAllowances)     || 0,
          helbMonthlyDeduction: parseFloat(body.helbMonthlyDeduction) || 0,
        })
        .then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["employee", employee.id] });
      toast("Salary updated", "success");
      onClose();
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? "Failed to update salary.";
      toast(msg, "error");
    },
  });

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const grossEstimate =
    (parseFloat(form.basicSalary) || 0) +
    (parseFloat(form.housingAllowance) || 0) +
    (parseFloat(form.transportAllowance) || 0) +
    (parseFloat(form.medicalAllowance) || 0) +
    (parseFloat(form.otherAllowances) || 0);

  const moneyInputCls = inputCls + " font-mono";

  return (
    <BaseModal labelId="salary-modal-title" onClose={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-[520px] flex flex-col">
        <div className="px-6 py-5 border-b border-neutral-100">
          <h2 id="salary-modal-title" className="text-[16px] font-bold text-neutral-900">
            Update Salary Structure
          </h2>
          <p className="text-[13px] text-neutral-500 mt-0.5">
            {employee.firstName} {employee.lastName} · {employee.currency}
          </p>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel required>Basic Salary</FieldLabel>
              <input type="number" min="0" step="100" value={form.basicSalary} onChange={set("basicSalary")} disabled={mutation.isPending} className={moneyInputCls} />
            </div>
            <div>
              <FieldLabel>Housing Allowance</FieldLabel>
              <input type="number" min="0" step="100" value={form.housingAllowance} onChange={set("housingAllowance")} disabled={mutation.isPending} className={moneyInputCls} />
            </div>
            <div>
              <FieldLabel>Transport Allowance</FieldLabel>
              <input type="number" min="0" step="100" value={form.transportAllowance} onChange={set("transportAllowance")} disabled={mutation.isPending} className={moneyInputCls} />
            </div>
            <div>
              <FieldLabel>Medical Allowance</FieldLabel>
              <input type="number" min="0" step="100" value={form.medicalAllowance} onChange={set("medicalAllowance")} disabled={mutation.isPending} className={moneyInputCls} />
            </div>
            <div>
              <FieldLabel>Other Allowances</FieldLabel>
              <input type="number" min="0" step="100" value={form.otherAllowances} onChange={set("otherAllowances")} disabled={mutation.isPending} className={moneyInputCls} />
            </div>
            <div>
              <FieldLabel>HELB Monthly Deduction</FieldLabel>
              <input type="number" min="0" step="100" value={form.helbMonthlyDeduction} onChange={set("helbMonthlyDeduction")} disabled={mutation.isPending} className={moneyInputCls} />
            </div>
          </div>

          {/* Gross estimate */}
          <div className="flex items-center justify-between bg-neutral-50 rounded-lg px-4 py-3 border border-neutral-200">
            <span className="text-[12.5px] text-neutral-500 font-medium">Estimated Gross Pay</span>
            <span className="text-[14px] font-bold text-near-black font-mono">
              {formatKES(grossEstimate)}
            </span>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-neutral-100 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="flex-1 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13.5px] py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!(parseFloat(form.basicSalary) > 0) || mutation.isPending}
            onClick={() => mutation.mutate(form)}
            className="flex-1 bg-brand-900 hover:bg-brand-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[13.5px] py-2.5 rounded-lg transition-colors"
          >
            {mutation.isPending ? "Saving…" : "Update Salary"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

// ─── Terminate Modal ──────────────────────────────────────────────────────────

function TerminateModal({
  employeeId,
  employeeName,
  onClose,
}: {
  employeeId: string;
  employeeName: string;
  onClose: () => void;
}) {
  const [reason, setReason] = useState("");
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation<void, AxiosError<{ message?: string }>, { reason: string }>({
    mutationFn: (body) =>
      apiClient.patch(`/api/v1/employees/${employeeId}/terminate`, body).then(() => undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
      void queryClient.invalidateQueries({ queryKey: ["employee", employeeId] });
      toast("Employee terminated", "success");
      onClose();
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? "Failed to terminate employee. Please try again.";
      toast(msg, "error");
    },
  });

  return (
    <BaseModal labelId="terminate-modal-title" onClose={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-[480px] p-6">
        <h2 id="terminate-modal-title" className="text-[16px] font-bold text-neutral-900 mb-1">
          Terminate Employee
        </h2>
        <p className="text-[13px] text-neutral-500 mb-5">
          You are terminating{" "}
          <span className="font-semibold text-near-black">{employeeName}</span>. This action
          cannot be undone.
        </p>

        <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
          Reason <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          maxLength={500}
          placeholder="Provide a reason for termination…"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={mutation.isPending}
          className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13.5px] text-near-black resize-none focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 placeholder:text-neutral-300"
        />
        <p className="text-[11px] text-neutral-400 text-right mt-1">{reason.length}/500</p>

        <div className="flex items-center gap-3 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="flex-1 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13.5px] py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!reason.trim() || mutation.isPending}
            onClick={() => mutation.mutate({ reason: reason.trim() })}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[13.5px] py-2.5 rounded-lg transition-colors"
          >
            {mutation.isPending ? "Terminating…" : "Confirm Termination"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

// ─── Reset Password Modal ─────────────────────────────────────────────────────

interface PasswordResetResult {
  userId: string;
  email: string;
  temporaryPassword: string;
}

function ResetPasswordModal({
  userAccount,
  employeeName,
  onClose,
}: {
  userAccount: UserAccount;
  employeeName: string;
  onClose: () => void;
}) {
  const [result, setResult] = useState<PasswordResetResult | null>(null);
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const mutation = useMutation<PasswordResetResult, AxiosError<{ message?: string }>, void>({
    mutationFn: () =>
      apiClient
        .post<PasswordResetResult>(`/api/v1/auth/users/${userAccount.id}/admin-password-reset`)
        .then((r) => r.data),
    onSuccess: (data) => {
      setResult(data);
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? "Failed to reset password.";
      toast(msg, "error");
      onClose();
    },
  });

  function handleCopy() {
    if (!result) return;
    void navigator.clipboard.writeText(result.temporaryPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  // Step 1 — Confirmation
  if (!result) {
    return (
      <BaseModal labelId="reset-pw-modal-title" onClose={mutation.isPending ? onClose : onClose}>
        <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-[440px] p-6 flex flex-col gap-4">
          <h2 id="reset-pw-modal-title" className="text-[16px] font-bold text-neutral-900">
            Reset Password
          </h2>
          <p className="text-[13px] text-neutral-600">
            Reset the password for{" "}
            <span className="font-semibold text-near-black">{employeeName}</span>?
            A temporary password will be generated. They will be required to set a new password on next login.
          </p>
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="flex-1 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13.5px] py-2.5 rounded-lg transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
              className="flex-1 bg-brand-900 hover:bg-brand-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[13.5px] py-2.5 rounded-lg transition-colors"
            >
              {mutation.isPending ? "Generating…" : "Reset Password"}
            </button>
          </div>
        </div>
      </BaseModal>
    );
  }

  // Step 2 — Temp password display (no auto-close)
  return (
    <BaseModal labelId="reset-pw-result-title" onClose={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-[460px] p-6 flex flex-col gap-4">
        <h2 id="reset-pw-result-title" className="text-[16px] font-bold text-neutral-900">
          Password Reset
        </h2>
        <p className="text-[13px] text-neutral-500">
          New temporary password for{" "}
          <span className="font-semibold text-near-black">{result.email}</span>
        </p>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
            Temporary Password
          </p>
          <div className="flex items-center gap-3">
            <code className="flex-1 font-mono text-[18px] font-bold text-near-black tracking-wider break-all">
              {result.temporaryPassword}
            </code>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-[12px] font-semibold bg-white hover:bg-neutral-100 transition-colors flex-shrink-0"
            >
              {copied ? (
                <span className="text-brand-700">Copied!</span>
              ) : (
                <span className="text-neutral-700">Copy</span>
              )}
            </button>
          </div>
        </div>

        <div className="flex items-start gap-2.5 rounded-xl bg-amber-light border border-amber px-4 py-3">
          <AlertTriangle size={15} className="text-amber flex-shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-amber-text leading-relaxed">
            Share this with the employee directly. They will be required to change it on first login.
            This password will not be shown again.
          </p>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13.5px] px-6 py-2.5 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

// ─── Change Role Modal ────────────────────────────────────────────────────────

function ChangeRoleModal({
  userAccount,
  employeeId,
  employeeName,
  workspace,
  onClose,
}: {
  userAccount: UserAccount;
  employeeId: string;
  employeeName: string;
  workspace: string;
  onClose: () => void;
}) {
  const [selectedRole, setSelectedRole] = useState<string>(userAccount.role);
  const [confirmed, setConfirmed] = useState(false);
  const [deptError, setDeptError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const toast = useToast();
  const currentUser = useCurrentUser();

  const mutation = useMutation<UserAccount, AxiosError<{ error?: string; message?: string }>, string>({
    mutationFn: (role) =>
      apiClient
        .patch<UserAccount>(`/api/v1/auth/users/${userAccount.id}/role`, { role })
        .then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["employee-user", employeeId] });
      // If the role change targets the currently logged-in user, refetch their cached
      // identity immediately so the UI reflects the new role without waiting 60 seconds.
      if (currentUser?.employeeId === employeeId) {
        void queryClient.invalidateQueries({ queryKey: ["current-user"] });
      }
      toast(`Role updated to ${roleLabel(selectedRole)}`, "success");
      onClose();
    },
    onError: (err) => {
      const errCode = err.response?.data?.error;
      const msg = err.response?.data?.message ?? "Failed to change role.";
      if (errCode === "DEPARTMENT_REQUIRED") {
        setDeptError(msg);
      } else {
        toast(msg, "error");
      }
    },
  });

  const hasChanged = selectedRole !== userAccount.role;

  return (
    <BaseModal labelId="change-role-modal-title" onClose={onClose}>
      <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-[440px] flex flex-col">
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100">
          <h2 id="change-role-modal-title" className="text-[16px] font-bold text-neutral-900">
            Change Role
          </h2>
          <p className="text-[13px] text-neutral-500 mt-0.5">{employeeName}</p>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          {/* Current role */}
          <div className="flex items-center justify-between bg-neutral-50 rounded-lg px-4 py-3 border border-neutral-200">
            <span className="text-[12.5px] text-neutral-500">Current role</span>
            <span className="text-[13px] font-semibold text-near-black">{roleLabel(userAccount.role)}</span>
          </div>

          {/* New role selector */}
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
              New Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => { setSelectedRole(e.target.value); setDeptError(null); }}
              disabled={mutation.isPending}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 disabled:bg-neutral-50"
            >
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </div>

          {/* Option C error — department required */}
          {deptError && (
            <div className="bg-amber-light border border-amber rounded-lg px-4 py-3 text-[12.5px] text-amber-text">
              <p className="font-semibold mb-1">{deptError}</p>
              <Link
                href={`/${workspace}/admin/employees/${employeeId}`}
                className="underline underline-offset-2 hover:opacity-80 font-medium"
                onClick={onClose}
              >
                Go to employee profile to set department →
              </Link>
            </div>
          )}

          {/* Confirmation step */}
          {hasChanged && !deptError && (
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                disabled={mutation.isPending}
                className="mt-0.5 accent-brand-900"
              />
              <span className="text-[12.5px] text-neutral-600">
                I confirm changing <strong>{employeeName}</strong>&apos;s role from{" "}
                <strong>{roleLabel(userAccount.role)}</strong> to{" "}
                <strong>{roleLabel(selectedRole)}</strong>. Their active session will be
                invalidated and they will need to log in again.
              </span>
            </label>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={mutation.isPending}
            className="flex-1 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13.5px] py-2.5 rounded-lg transition-colors disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!hasChanged || !confirmed || mutation.isPending}
            onClick={() => mutation.mutate(selectedRole)}
            className="flex-1 bg-brand-900 hover:bg-brand-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[13.5px] py-2.5 rounded-lg transition-colors"
          >
            {mutation.isPending ? "Saving…" : "Change Role"}
          </button>
        </div>
      </div>
    </BaseModal>
  );
}

// ─── Actions dropdown ─────────────────────────────────────────────────────────

function ActionsMenu({
  status,
  employeeId,
  employeeName,
}: {
  status: EmployeeStatus;
  employeeId: string;
  employeeName: string;
}) {
  const [open, setOpen] = useState(false);
  const [showTerminate, setShowTerminate] = useState(false);

  if (status === "TERMINATED") return null;

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1.5 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13px] h-9 px-3.5 rounded-lg transition-colors"
        >
          Actions
          <ChevronDown size={13} />
        </button>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
            <div className="absolute right-0 top-10 z-20 bg-white border border-neutral-200 rounded-lg shadow-lg min-w-[180px] py-1">
              <button
                onClick={() => { setOpen(false); setShowTerminate(true); }}
                className="w-full text-left px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50 font-medium transition-colors"
              >
                Terminate Employee
              </button>
            </div>
          </>
        )}
      </div>

      {showTerminate && (
        <TerminateModal
          employeeId={employeeId}
          employeeName={employeeName}
          onClose={() => setShowTerminate(false)}
        />
      )}
    </>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function EmployeeDetailPage({
  params,
}: {
  params: Promise<{ employeeId: string }>;
}) {
  const { employeeId } = use(params);
  const workspace = useWorkspace();
  const currentUser = useCurrentUser();
  const [showEdit, setShowEdit]           = useState(false);
  const [showSalary, setShowSalary]       = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showResetPw, setShowResetPw]     = useState(false);

  const isAdmin = currentUser?.roles.includes("ADMIN")      ?? false;
  const isHrMgr = currentUser?.roles.includes("HR_MANAGER") ?? false;

  const { data: employee, isLoading, isError, refetch } = useQuery<EmployeeDetail>({
    queryKey: ["employee", employeeId],
    queryFn: () =>
      apiClient.get<EmployeeDetail>(`/api/v1/employees/${employeeId}`).then((r) => r.data),
    enabled: Boolean(employeeId),
  });

  // Determine if this employee has any payslips (locks statutory IDs)
  const { data: payslipPage } = useQuery<{ totalElements: number }>({
    queryKey: ["employee-payslips-count", employeeId],
    queryFn: () =>
      apiClient
        .get<{ totalElements: number }>(`/api/v1/payroll/employees/${employeeId}/payslips?size=1`)
        .then((r) => r.data),
    enabled: Boolean(employeeId),
    staleTime: 60_000,
  });

  const hasPayslips = (payslipPage?.totalElements ?? 0) > 0;

  // Fetch the linked auth user for role display and role-change action
  const { data: userAccount } = useQuery<UserAccount>({
    queryKey: ["employee-user", employeeId],
    queryFn: () =>
      apiClient
        .get<UserAccount>(`/api/v1/auth/users/by-employee/${employeeId}`)
        .then((r) => r.data)
        .catch(() => null as unknown as UserAccount),
    enabled: Boolean(employeeId) && isAdmin,
    staleTime: 30_000,
  });

  // Hide Change Role on caller's own profile (Task 3.6)
  const isOwnProfile  = currentUser?.employeeId === employeeId;
  const canChangeRole = isAdmin && !isOwnProfile && userAccount != null;
  const canResetPw    = (isAdmin || isHrMgr) && !isOwnProfile && userAccount != null;

  const fullName = employee ? `${employee.firstName} ${employee.lastName}` : "Employee";
  const subtitle =
    employee
      ? `Employee #${employee.employeeNumber}${employee.positionTitle ? ` · ${employee.positionTitle}` : ""}`
      : undefined;

  const isTerminated = employee?.status === "TERMINATED";

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title={isLoading ? "Loading…" : fullName}
        subtitle={subtitle}
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/${workspace}/admin/employees`}
              className="flex items-center gap-1.5 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13px] h-9 px-3.5 rounded-lg transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </Link>
            {employee && !isTerminated && (
              <>
                <button
                  onClick={() => setShowEdit(true)}
                  className="flex items-center gap-1.5 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-semibold text-[13px] h-9 px-3.5 rounded-lg transition-colors"
                >
                  <Pencil size={13} />
                  Edit
                </button>
                {canResetPw && (
                  <button
                    onClick={() => setShowResetPw(true)}
                    className="flex items-center gap-1.5 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-semibold text-[13px] h-9 px-3.5 rounded-lg transition-colors"
                  >
                    <KeyRound size={13} />
                    Reset password
                  </button>
                )}
                <ActionsMenu
                  status={employee.status}
                  employeeId={employee.id}
                  employeeName={fullName}
                />
              </>
            )}
          </div>
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8 space-y-5">
        {/* Termination banner */}
        {employee?.status === "TERMINATED" && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-[13px] text-red-700">
            <AlertTriangle size={15} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">This employee has been terminated.</p>
              {employee.terminationDate && (
                <p className="mt-0.5 text-red-600">Date: {formatDate(employee.terminationDate)}</p>
              )}
            </div>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
            <AlertTriangle size={15} className="flex-shrink-0" />
            <span className="flex-1">Could not load employee details.</span>
            <button
              onClick={() => void refetch()}
              className="ml-auto text-[12px] font-semibold underline underline-offset-2 hover:opacity-80"
            >
              Retry
            </button>
          </div>
        )}

        {/* Skeleton / content */}
        {isLoading ? (
          <DetailSkeleton />
        ) : employee ? (
          <div className="grid grid-cols-2 gap-5">
            {/* Personal Info */}
            <InfoCard title="Personal Information">
              <InfoRow label="Email"       value={employee.email} />
              <InfoRow label="Phone"       value={employee.phoneNumber} />
              <InfoRow label="National ID" value={employee.nationalId} />
              <InfoRow label="KRA PIN"     value={employee.kraPin} />
              <InfoRow label="Date of Birth" value={formatDate(employee.dateOfBirth)} />
              <InfoRow label="Gender"      value={employee.gender ?? "—"} />
            </InfoCard>

            {/* Employment */}
            <InfoCard title="Employment">
              <InfoRow label="Department" value={employee.departmentName ?? "—"} />
              <InfoRow label="Position"   value={employee.positionTitle ?? "—"} />
              <InfoRow
                label="Type"
                value={
                  <span className="font-mono text-[11px] bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded">
                    {employee.employmentType}
                  </span>
                }
              />
              <InfoRow label="Hire Date" value={formatDate(employee.hireDate)} />
              <InfoRow
                label="Status"
                value={
                  <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusBadgeClass(employee.status)}`}>
                    {statusLabel(employee.status)}
                  </span>
                }
              />
            </InfoCard>

            {/* Compensation */}
            <InfoCard
              title="Compensation"
              action={
                !isTerminated ? (
                  <button
                    onClick={() => setShowSalary(true)}
                    className="flex items-center gap-1 text-[11.5px] font-semibold text-brand-700 hover:text-brand-900 transition-colors"
                  >
                    <Pencil size={11} />
                    Update
                  </button>
                ) : undefined
              }
            >
              <InfoRow label="Basic Salary"       value={<span className="font-semibold">{formatKES(employee.basicSalary)}</span>} />
              <InfoRow label="Housing Allowance"  value={employee.housingAllowance > 0 ? formatKES(employee.housingAllowance) : "—"} />
              <InfoRow label="Transport Allowance" value={employee.transportAllowance > 0 ? formatKES(employee.transportAllowance) : "—"} />
              <InfoRow label="Medical Allowance"  value={employee.medicalAllowance > 0 ? formatKES(employee.medicalAllowance) : "—"} />
              <InfoRow label="Other Allowances"   value={employee.otherAllowances > 0 ? formatKES(employee.otherAllowances) : "—"} />
              <InfoRow label="HELB Deduction"     value={employee.helbMonthlyDeduction > 0 ? formatKES(employee.helbMonthlyDeduction) : "—"} />
              <div className="border-t border-neutral-100 pt-3 mt-1">
                <InfoRow label="Gross Pay" value={<span className="font-bold text-near-black">{formatKES(employee.grossPay)}</span>} />
              </div>
              <InfoRow label="Currency" value={employee.currency} />
            </InfoCard>

            {/* Payment Method */}
            <InfoCard title="Payment Method">
              <InfoRow label="Bank Name"    value={employee.bankName ?? "—"} />
              <InfoRow label="Bank Account" value={employee.bankAccountNumber ?? "—"} />
              <InfoRow label="M-Pesa"       value={employee.phoneNumber} />
            </InfoCard>

            {/* Statutory Numbers */}
            <InfoCard title="Statutory Numbers">
              <InfoRow label="KRA PIN"           value={employee.kraPin} />
              <InfoRow label="NSSF Number"       value={employee.nssfNumber ?? "—"} />
              <InfoRow label="NHIF / SHIF Number" value={employee.nhifNumber ?? "—"} />
              <InfoRow
                label="HELB Monthly Deduction"
                value={employee.helbMonthlyDeduction > 0 ? formatKES(employee.helbMonthlyDeduction) : "—"}
              />
              {hasPayslips && (
                <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-text bg-amber-light rounded-md px-2.5 py-1.5 font-medium">
                  <Lock size={10} />
                  Statutory IDs are locked — employee has processed payroll
                </div>
              )}
            </InfoCard>

            {/* Role — ADMIN only, hidden on own profile */}
            {isAdmin && (
              <InfoCard
                title="System Role"
                action={
                  canChangeRole ? (
                    <button
                      onClick={() => setShowRoleModal(true)}
                      className="flex items-center gap-1 text-[11.5px] font-semibold text-brand-700 hover:text-brand-900 transition-colors"
                    >
                      <ShieldCheck size={11} />
                      Change role
                    </button>
                  ) : undefined
                }
              >
                {userAccount ? (
                  <>
                    <InfoRow
                      label="Current role"
                      value={
                        <span className="inline-flex items-center gap-1 text-[11.5px] font-semibold bg-brand-50 text-brand-800 px-2.5 py-1 rounded-full border border-brand-200">
                          <ShieldCheck size={10} />
                          {roleLabel(userAccount.role)}
                        </span>
                      }
                    />
                    <InfoRow
                      label="Account status"
                      value={
                        <span className={`text-[11.5px] font-semibold ${userAccount.active ? "text-brand-700" : "text-neutral-400"}`}>
                          {userAccount.active ? "Active" : "Inactive"}
                        </span>
                      }
                    />
                    {isOwnProfile && (
                      <p className="text-[11px] text-neutral-400 italic mt-1">
                        Role change unavailable on your own profile.
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-[12.5px] text-neutral-400">No linked user account.</p>
                )}
              </InfoCard>
            )}
          </div>
        ) : null}
      </div>

      {/* Modals */}
      {employee && showEdit && (
        <EditEmployeeModal
          employee={employee}
          hasPayslips={hasPayslips}
          onClose={() => setShowEdit(false)}
        />
      )}
      {employee && showSalary && (
        <SalaryModal
          employee={employee}
          onClose={() => setShowSalary(false)}
        />
      )}
      {employee && userAccount && showRoleModal && canChangeRole && (
        <ChangeRoleModal
          userAccount={userAccount}
          employeeId={employee.id}
          employeeName={fullName}
          workspace={workspace}
          onClose={() => setShowRoleModal(false)}
        />
      )}
      {employee && userAccount && showResetPw && canResetPw && (
        <ResetPasswordModal
          userAccount={userAccount}
          employeeName={fullName}
          onClose={() => setShowResetPw(false)}
        />
      )}
    </div>
  );
}
