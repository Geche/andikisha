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

type EmploymentType = "PERMANENT" | "CONTRACT" | "CASUAL" | "INTERN";

interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  kraPin: string;
  department?: string;
  jobTitle?: string;
  employmentType: EmploymentType;
  hireDate: string;
  basicSalary: number;
  currency: string;
  bankName?: string;
  bankAccount?: string;
  mpesaNumber?: string;
  nssfNumber?: string;
  shifNumber?: string;
}

interface CreatedEmployee {
  id: string;
}

// ─── Field component ─────────────────────────────────────────────────────────

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
        {label}{" "}
        {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-[13.5px] text-[#02110C] focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] placeholder:text-gray-300";

// ─── Section header ──────────────────────────────────────────────────────────

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-widest text-[#166A50] mb-4">
      {children}
    </p>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function NewEmployeePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const toast = useToast();

  // ── Form state ──
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [kraPin, setKraPin] = useState("");
  const [department, setDepartment] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [employmentType, setEmploymentType] = useState<EmploymentType>("PERMANENT");
  const [hireDate, setHireDate] = useState("");
  const [basicSalary, setBasicSalary] = useState("");
  const [bankName, setBankName] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [mpesaNumber, setMpesaNumber] = useState("");
  const [nssfNumber, setNssfNumber] = useState("");
  const [shifNumber, setShifNumber] = useState("");
  const [paymentError, setPaymentError] = useState("");

  const mutation = useMutation<CreatedEmployee, AxiosError<{ message?: string }>, CreateEmployeeRequest>({
    mutationFn: (body) =>
      apiClient.post<CreatedEmployee>("/api/v1/employees", body).then((r) => r.data),
    onSuccess: (data) => {
      void queryClient.invalidateQueries({ queryKey: ["employees"] });
      toast("Employee added successfully", "success");
      router.push(`/employees/${data.id}`);
    },
    onError: (err) => {
      const msg =
        err.response?.data?.message ?? "Failed to add employee. Please try again.";
      toast(msg, "error");
    },
  });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setPaymentError("");

    // Client-side: require at least one payment method
    if (!bankAccount.trim() && !mpesaNumber.trim()) {
      setPaymentError("Provide at least one payment method: bank account or M-Pesa number.");
      return;
    }

    const body: CreateEmployeeRequest = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
      nationalId: nationalId.trim(),
      kraPin: kraPin.trim(),
      employmentType,
      hireDate,
      basicSalary: parseFloat(basicSalary),
      currency: "KES",
    };
    if (department.trim()) body.department = department.trim();
    if (jobTitle.trim()) body.jobTitle = jobTitle.trim();
    if (bankName.trim()) body.bankName = bankName.trim();
    if (bankAccount.trim()) body.bankAccount = bankAccount.trim();
    if (mpesaNumber.trim()) body.mpesaNumber = mpesaNumber.trim();
    if (nssfNumber.trim()) body.nssfNumber = nssfNumber.trim();
    if (shifNumber.trim()) body.shifNumber = shifNumber.trim();

    mutation.mutate(body);
  }

  const isPending = mutation.isPending;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Add Employee"
        actions={
          <Link
            href="/employees"
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

            {/* Personal Information */}
            <div>
              <SectionHeader>Personal Information</SectionHeader>
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" required>
                  <input
                    className={inputCls}
                    type="text"
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={isPending}
                  />
                </Field>
                <Field label="Last Name" required>
                  <input
                    className={inputCls}
                    type="text"
                    placeholder="Mwangi"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={isPending}
                  />
                </Field>
                <Field label="Email Address" required>
                  <input
                    className={inputCls}
                    type="email"
                    placeholder="jane.mwangi@company.co.ke"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isPending}
                  />
                </Field>
                <Field label="Phone Number" required>
                  <input
                    className={inputCls}
                    type="tel"
                    placeholder="+254 700 000 000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                    disabled={isPending}
                  />
                </Field>
                <Field label="National ID" required>
                  <input
                    className={inputCls}
                    type="text"
                    placeholder="12345678"
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    required
                    disabled={isPending}
                  />
                </Field>
                <Field label="KRA PIN" required>
                  <input
                    className={inputCls}
                    type="text"
                    placeholder="A000000000Z"
                    value={kraPin}
                    onChange={(e) => setKraPin(e.target.value)}
                    required
                    disabled={isPending}
                  />
                </Field>
              </div>
            </div>

            {/* Employment */}
            <div>
              <SectionHeader>Employment</SectionHeader>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Department">
                  <input
                    className={inputCls}
                    type="text"
                    placeholder="Engineering"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={isPending}
                  />
                </Field>
                <Field label="Job Title">
                  <input
                    className={inputCls}
                    type="text"
                    placeholder="Software Engineer"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    disabled={isPending}
                  />
                </Field>
                <Field label="Employment Type" required>
                  <select
                    className={inputCls}
                    value={employmentType}
                    onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
                    required
                    disabled={isPending}
                  >
                    <option value="PERMANENT">Permanent</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="CASUAL">Casual</option>
                    <option value="INTERN">Intern</option>
                  </select>
                </Field>
                <Field label="Hire Date" required>
                  <input
                    className={inputCls}
                    type="date"
                    value={hireDate}
                    onChange={(e) => setHireDate(e.target.value)}
                    required
                    disabled={isPending}
                  />
                </Field>
              </div>
            </div>

            {/* Compensation */}
            <div>
              <SectionHeader>Compensation</SectionHeader>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Basic Salary (KES)" required>
                  <input
                    className={inputCls}
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="50000"
                    value={basicSalary}
                    onChange={(e) => setBasicSalary(e.target.value)}
                    required
                    disabled={isPending}
                  />
                </Field>
                <Field label="Currency">
                  <div className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13.5px] text-gray-400 bg-gray-50 select-none">
                    KES — Kenyan Shilling
                  </div>
                </Field>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <SectionHeader>Payment Method</SectionHeader>
              <p className="text-[12px] text-gray-400 mb-4 -mt-2">
                At least one of bank account or M-Pesa number is required.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Bank Name">
                  <input
                    className={inputCls}
                    type="text"
                    placeholder="Equity Bank"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    disabled={isPending}
                  />
                </Field>
                <Field label="Bank Account Number">
                  <input
                    className={inputCls}
                    type="text"
                    placeholder="0123456789"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    disabled={isPending}
                  />
                </Field>
                <Field label="M-Pesa Number">
                  <input
                    className={inputCls}
                    type="tel"
                    placeholder="+254 700 000 000"
                    value={mpesaNumber}
                    onChange={(e) => setMpesaNumber(e.target.value)}
                    disabled={isPending}
                  />
                </Field>
              </div>
              {paymentError && (
                <p className="mt-2 text-[12px] text-red-600">{paymentError}</p>
              )}
            </div>

            {/* Statutory Numbers */}
            <div>
              <SectionHeader>Statutory Numbers</SectionHeader>
              <div className="grid grid-cols-2 gap-4">
                <Field label="NSSF Number">
                  <input
                    className={inputCls}
                    type="text"
                    placeholder="0000000"
                    value={nssfNumber}
                    onChange={(e) => setNssfNumber(e.target.value)}
                    disabled={isPending}
                  />
                </Field>
                <Field label="SHIF Number">
                  <input
                    className={inputCls}
                    type="text"
                    placeholder="0000000"
                    value={shifNumber}
                    onChange={(e) => setShifNumber(e.target.value)}
                    disabled={isPending}
                  />
                </Field>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-[#E8A020] hover:bg-[#C98510] disabled:opacity-60 disabled:cursor-not-allowed text-[#02110C] font-bold text-[14px] py-3 rounded-lg transition-colors"
            >
              {isPending ? "Adding Employee…" : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
