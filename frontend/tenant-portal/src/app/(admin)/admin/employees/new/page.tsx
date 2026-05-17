"use client";

import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader, InlineAlert, useToast } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import type { AxiosError } from "axios";

// ─── Types ───────────────────────────────────────────────────────────────────

type EmploymentType = "PERMANENT" | "CONTRACT" | "CASUAL" | "INTERN";

interface DepartmentOption { id: string; name: string }
interface PositionOption  { id: string; title: string }

interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber: string;
  nationalId: string;
  kraPin: string;
  nhifNumber: string;
  nssfNumber: string;
  employmentType: EmploymentType;
  hireDate?: string;
  dateOfBirth?: string;
  gender?: string;
  departmentId?: string;
  positionId?: string;
  basicSalary: number;
  housingAllowance?: number;
  transportAllowance?: number;
  medicalAllowance?: number;
  helbMonthlyDeduction?: number;
  currency: string;
}

interface CreatedEmployee { id: string }

// ─── Validation patterns (mirrors backend @Pattern annotations) ───────────────

const PHONE_RE   = /^(\+254|0)7\d{8}$/;
const NATIONAL_RE = /^\d{6,10}$/;
const KRA_RE      = /^[A-Z]\d{9}[A-Z]$/;

function validateFields(f: ReturnType<typeof buildFieldMap>): Record<string, string> {
  const errs: Record<string, string> = {};
  if (!f.firstName.trim())   errs.firstName   = "First name is required";
  if (!f.lastName.trim())    errs.lastName    = "Last name is required";
  if (!PHONE_RE.test(f.phoneNumber.trim()))
    errs.phoneNumber = "Must be a valid Kenyan phone (+254XXXXXXXXX or 07XXXXXXXX)";
  if (!NATIONAL_RE.test(f.nationalId.trim()))
    errs.nationalId  = "Must be 6 – 10 digits";
  if (!KRA_RE.test(f.kraPin.trim().toUpperCase()))
    errs.kraPin      = "Format: one uppercase letter, 9 digits, one uppercase letter (e.g. A123456789X)";
  if (!f.nhifNumber.trim())  errs.nhifNumber  = "NHIF/SHIF number is required";
  if (!f.nssfNumber.trim())  errs.nssfNumber  = "NSSF number is required";
  if (!f.basicSalary || parseFloat(f.basicSalary) <= 0)
    errs.basicSalary = "Basic salary must be a positive number";
  return errs;
}

function buildFieldMap(state: FieldState) { return state; }

// ─── Field component ─────────────────────────────────────────────────────────

function Field({
  label, required, error, hint, children,
}: {
  label: string; required?: boolean; error?: string; hint?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-[11.5px] text-gray-400 mt-1">{hint}</p>}
      {error && <p className="text-[11.5px] text-red-600 mt-1">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-[13.5px] text-near-black " +
  "focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 " +
  "placeholder:text-gray-300 disabled:bg-gray-50 disabled:text-gray-400";

const errInputCls =
  "w-full border border-red-300 rounded-lg px-3 py-2 text-[13.5px] text-near-black " +
  "focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 " +
  "placeholder:text-gray-300 disabled:bg-gray-50";

function inputClass(error?: string) { return error ? errInputCls : inputCls; }

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest text-brand-700 mb-4">
      {children}
    </p>
  );
}

// ─── Field state ─────────────────────────────────────────────────────────────

interface FieldState {
  firstName: string; lastName: string; email: string;
  phoneNumber: string; nationalId: string;
  kraPin: string; nhifNumber: string; nssfNumber: string;
  employmentType: EmploymentType; hireDate: string; dateOfBirth: string; gender: string;
  departmentId: string; positionId: string;
  basicSalary: string; housingAllowance: string; transportAllowance: string; medicalAllowance: string;
  helbMonthlyDeduction: string;
}

const EMPTY: FieldState = {
  firstName: "", lastName: "", email: "",
  phoneNumber: "", nationalId: "",
  kraPin: "", nhifNumber: "", nssfNumber: "",
  employmentType: "PERMANENT", hireDate: "", dateOfBirth: "", gender: "",
  departmentId: "", positionId: "",
  basicSalary: "", housingAllowance: "", transportAllowance: "", medicalAllowance: "",
  helbMonthlyDeduction: "",
};

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NewEmployeePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [f, setF] = useState<FieldState>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function set(key: keyof FieldState, val: string) {
    setF((prev) => ({ ...prev, [key]: val }));
    if (submitted && errors[key]) {
      setErrors((prev) => { const next = { ...prev }; delete next[key]; return next; });
    }
  }

  const { data: departments = [] } = useQuery<DepartmentOption[]>({
    queryKey: ["departments"],
    queryFn: () => apiClient.get("/api/v1/departments").then((r) => r.data),
    staleTime: 60_000,
  });

  const { data: positions = [] } = useQuery<PositionOption[]>({
    queryKey: ["positions"],
    queryFn: () => apiClient.get("/api/v1/positions").then((r) => r.data),
    staleTime: 60_000,
  });

  const mutation = useMutation<CreatedEmployee, AxiosError<{ message?: string }>, CreateEmployeeRequest>({
    mutationFn: (body) =>
      apiClient.post<CreatedEmployee>("/api/v1/employees", body).then((r) => r.data),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast("Employee added successfully", "success");
      router.push(`/admin/employees/${data.id}`);
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? "Failed to add employee. Please try again.";
      toast(msg, "error");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);

    const errs = validateFields(buildFieldMap(f));
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      const firstErrKey = Object.keys(errs)[0];
      const el = document.getElementById(firstErrKey);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const body: CreateEmployeeRequest = {
      firstName:      f.firstName.trim(),
      lastName:       f.lastName.trim(),
      phoneNumber:    f.phoneNumber.trim(),
      nationalId:     f.nationalId.trim(),
      kraPin:         f.kraPin.trim().toUpperCase(),
      nhifNumber:     f.nhifNumber.trim(),
      nssfNumber:     f.nssfNumber.trim(),
      employmentType: f.employmentType,
      basicSalary:    parseFloat(f.basicSalary),
      currency:       "KES",
    };

    if (f.email.trim())            body.email          = f.email.trim();
    if (f.hireDate)                body.hireDate       = f.hireDate;
    if (f.dateOfBirth)             body.dateOfBirth    = f.dateOfBirth;
    if (f.gender)                  body.gender         = f.gender;
    if (f.departmentId)            body.departmentId   = f.departmentId;
    if (f.positionId)              body.positionId     = f.positionId;
    if (f.housingAllowance.trim())      body.housingAllowance      = parseFloat(f.housingAllowance);
    if (f.transportAllowance.trim())    body.transportAllowance    = parseFloat(f.transportAllowance);
    if (f.medicalAllowance.trim())      body.medicalAllowance      = parseFloat(f.medicalAllowance);
    if (f.helbMonthlyDeduction.trim())  body.helbMonthlyDeduction  = parseFloat(f.helbMonthlyDeduction);

    mutation.mutate(body);
  }

  const isPending = mutation.isPending;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Add Employee"
        actions={
          <Link
            href="/admin/employees"
            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold text-[13px] h-9 px-3.5 rounded-lg transition-colors"
          >
            <ArrowLeft size={14} />
            Back
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-8">
        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-white border border-gray-200 rounded-xl p-8 flex flex-col gap-8 max-w-3xl">

            {/* ── Personal Information ── */}
            <div>
              <SectionHeader>Personal Information</SectionHeader>
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" required error={errors.firstName}>
                  <input id="firstName" className={inputClass(errors.firstName)} type="text"
                    placeholder="Jane" value={f.firstName} disabled={isPending}
                    onChange={(e) => set("firstName", e.target.value)} />
                </Field>
                <Field label="Last Name" required error={errors.lastName}>
                  <input id="lastName" className={inputClass(errors.lastName)} type="text"
                    placeholder="Mwangi" value={f.lastName} disabled={isPending}
                    onChange={(e) => set("lastName", e.target.value)} />
                </Field>
                <Field label="Email Address" error={errors.email}
                  hint="Optional — used for payslip email delivery if provided">
                  <input id="email" className={inputClass(errors.email)} type="email"
                    placeholder="jane.mwangi@company.co.ke" value={f.email} disabled={isPending}
                    onChange={(e) => set("email", e.target.value)} />
                </Field>
                <Field label="Phone Number" required error={errors.phoneNumber}
                  hint="+254XXXXXXXXX or 07XXXXXXXX">
                  <input id="phoneNumber" className={inputClass(errors.phoneNumber)} type="tel"
                    placeholder="0712 345 678" value={f.phoneNumber} disabled={isPending}
                    onChange={(e) => set("phoneNumber", e.target.value)} />
                </Field>
                <Field label="National ID" required error={errors.nationalId}
                  hint="6 – 10 digits">
                  <input id="nationalId" className={inputClass(errors.nationalId)} type="text"
                    placeholder="12345678" value={f.nationalId} disabled={isPending}
                    onChange={(e) => set("nationalId", e.target.value)} />
                </Field>
                <Field label="Date of Birth">
                  <input id="dateOfBirth" className={inputCls} type="date"
                    value={f.dateOfBirth} disabled={isPending}
                    onChange={(e) => set("dateOfBirth", e.target.value)} />
                </Field>
                <Field label="Gender">
                  <select id="gender" className={inputCls} value={f.gender} disabled={isPending}
                    onChange={(e) => set("gender", e.target.value)}>
                    <option value="">— select —</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                    <option value="PREFER_NOT_TO_SAY">Prefer not to say</option>
                  </select>
                </Field>
              </div>
            </div>

            {/* ── Statutory IDs ── */}
            <div>
              <SectionHeader>Statutory Identifiers</SectionHeader>
              <div className="grid grid-cols-2 gap-4">
                <Field label="KRA PIN" required error={errors.kraPin}
                  hint="Format: letter + 9 digits + letter  (e.g. A123456789X)">
                  <input id="kraPin" className={inputClass(errors.kraPin)} type="text"
                    placeholder="A123456789X" value={f.kraPin} disabled={isPending}
                    onChange={(e) => set("kraPin", e.target.value.toUpperCase())} />
                </Field>
                <Field label="NHIF / SHIF Number" required error={errors.nhifNumber}>
                  <input id="nhifNumber" className={inputClass(errors.nhifNumber)} type="text"
                    placeholder="1234567" value={f.nhifNumber} disabled={isPending}
                    onChange={(e) => set("nhifNumber", e.target.value)} />
                </Field>
                <Field label="NSSF Number" required error={errors.nssfNumber}>
                  <input id="nssfNumber" className={inputClass(errors.nssfNumber)} type="text"
                    placeholder="1234567" value={f.nssfNumber} disabled={isPending}
                    onChange={(e) => set("nssfNumber", e.target.value)} />
                </Field>
                <Field label="HELB Monthly Deduction (KES)"
                  hint="Higher Education Loans Board repayment deducted post-tax. Leave blank if not applicable.">
                  <input id="helbMonthlyDeduction" className={inputCls} type="number"
                    min="0" step="0.01" placeholder="0" value={f.helbMonthlyDeduction}
                    disabled={isPending}
                    onChange={(e) => set("helbMonthlyDeduction", e.target.value)} />
                </Field>
              </div>
            </div>

            {/* ── Employment ── */}
            <div>
              <SectionHeader>Employment</SectionHeader>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Department">
                  <select id="departmentId" className={inputCls} value={f.departmentId}
                    disabled={isPending} onChange={(e) => set("departmentId", e.target.value)}>
                    <option value="">— none —</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Position" hint="Can be assigned after creation if not listed">
                  <select id="positionId" className={inputCls} value={f.positionId}
                    disabled={isPending} onChange={(e) => set("positionId", e.target.value)}>
                    <option value="">— none —</option>
                    {positions.map((p) => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Employment Type" required>
                  <select id="employmentType" className={inputCls} value={f.employmentType}
                    required disabled={isPending}
                    onChange={(e) => set("employmentType", e.target.value as EmploymentType)}>
                    <option value="PERMANENT">Permanent</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="CASUAL">Casual</option>
                    <option value="INTERN">Intern</option>
                  </select>
                </Field>
                <Field label="Hire Date">
                  <input id="hireDate" className={inputCls} type="date"
                    value={f.hireDate} disabled={isPending}
                    onChange={(e) => set("hireDate", e.target.value)} />
                </Field>
              </div>
            </div>

            {/* ── Compensation ── */}
            <div>
              <SectionHeader>Compensation</SectionHeader>
              <InlineAlert variant="warning" className="mb-4">
                Allowances directly affect PAYE, SHIF, and Housing Levy calculations. Entering zero
                where allowances exist will produce incorrect payroll and incorrect statutory filings
                with KRA. Casual workers typically have zero allowances; salaried employees usually
                have at least housing or transport.
              </InlineAlert>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Basic Salary (KES)" required error={errors.basicSalary}>
                  <input id="basicSalary" className={inputClass(errors.basicSalary)} type="number"
                    min="0" step="0.01" placeholder="50000" value={f.basicSalary}
                    disabled={isPending}
                    onChange={(e) => set("basicSalary", e.target.value)} />
                </Field>
                <Field label="Currency">
                  <div className={inputCls + " bg-gray-50 text-gray-400 select-none"}>
                    KES — Kenyan Shilling
                  </div>
                </Field>
                <Field label="Housing Allowance (KES)" hint="Leave blank if not applicable">
                  <input id="housingAllowance" className={inputCls} type="number"
                    min="0" step="0.01" placeholder="0" value={f.housingAllowance}
                    disabled={isPending}
                    onChange={(e) => set("housingAllowance", e.target.value)} />
                </Field>
                <Field label="Transport Allowance (KES)" hint="Leave blank if not applicable">
                  <input id="transportAllowance" className={inputCls} type="number"
                    min="0" step="0.01" placeholder="0" value={f.transportAllowance}
                    disabled={isPending}
                    onChange={(e) => set("transportAllowance", e.target.value)} />
                </Field>
                <Field label="Medical Allowance (KES)" hint="Leave blank if not applicable">
                  <input id="medicalAllowance" className={inputCls} type="number"
                    min="0" step="0.01" placeholder="0" value={f.medicalAllowance}
                    disabled={isPending}
                    onChange={(e) => set("medicalAllowance", e.target.value)} />
                </Field>
              </div>
            </div>

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-amber hover:bg-amber-dark disabled:opacity-60 disabled:cursor-not-allowed text-near-black font-bold text-[14px] py-3 rounded-lg transition-colors"
            >
              {isPending ? "Adding Employee…" : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
