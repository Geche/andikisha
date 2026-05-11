"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Eye, EyeOff, Copy, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { ApiError } from "@/lib/api-error";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/ui/Toaster";
import type { Plan, ProvisionedTenant } from "@/types/tenant";

interface ProvisionForm {
  organisationName: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminPhone: string;
  planId: string;
  billingCycle: "MONTHLY" | "ANNUAL";
  seatCount: number;
  agreedPriceKes: number;
  trialDays: number;
}

const EMPTY: ProvisionForm = {
  organisationName: "",
  adminEmail: "",
  adminFirstName: "",
  adminLastName: "",
  adminPhone: "+254",
  planId: "",
  billingCycle: "MONTHLY",
  seatCount: 10,
  agreedPriceKes: 0,
  trialDays: 14,
};

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
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const INPUT =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-[13.5px] text-[#02110C] focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] placeholder:text-gray-300";

export default function NewTenantPage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProvisionForm>(EMPTY);
  const [result, setResult] = useState<ProvisionedTenant | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: () => apiClient.get("/api/v1/plans").then((r) => r.data),
  });

  const provision = useMutation({
    mutationFn: (data: ProvisionForm) =>
      apiClient
        .post<ProvisionedTenant>("/api/v1/super-admin/tenants", data)
        .then((r) => r.data),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["tenants-list"] });
      toast("Tenant provisioned successfully", "success");
    },
    onError: (err: unknown) => {
      const msg = err instanceof ApiError ? err.message : "Failed to provision tenant";
      toast(msg, "error");
    },
  });

  function set<K extends keyof ProvisionForm>(key: K, value: ProvisionForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function copyPassword() {
    if (result) {
      navigator.clipboard.writeText(result.temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (result) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <PageHeader
          title="Tenant Provisioned"
          subtitle="Credentials for the new tenant admin"
        />
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-lg mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#D1F5E6] flex items-center justify-center mb-4">
              <CheckCircle2 size={24} className="text-[#27A870]" />
            </div>
            <h2 className="text-[18px] font-bold text-[#02110C] mb-1">
              {result.organisationName}
            </h2>
            <p className="text-[13px] text-gray-500 mb-6">
              Provisioned on {result.planName} plan · {result.seatCount} seats
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                  Admin Email
                </p>
                <p className="text-[13.5px] font-medium text-[#02110C]">
                  {result.adminEmail}
                </p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Temporary Password
                </p>
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                  <code className="flex-1 text-[13px] font-mono text-[#02110C]">
                    {passwordVisible
                      ? result.temporaryPassword
                      : "•".repeat(result.temporaryPassword.length)}
                  </code>
                  <button
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    {passwordVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button
                    onClick={copyPassword}
                    className="text-gray-400 hover:text-[#27A870] transition-colors"
                  >
                    {copied ? (
                      <CheckCircle2 size={14} className="text-[#27A870]" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-[11.5px] text-amber-600">
                  Share this password securely. It cannot be retrieved again.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => router.push(`/tenants/${result.tenantId}`)}
                className="flex-1 bg-[#0B3D2E] hover:bg-[#0a3328] text-white font-semibold text-[13.5px] h-10 rounded-lg transition-colors"
              >
                View Tenant
              </button>
              <button
                onClick={() => router.push("/tenants")}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold text-[13.5px] h-10 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Tenants
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="New Tenant"
        subtitle="Provision a new tenant and generate admin credentials"
        actions={
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 font-semibold text-[13.5px] h-9 px-3.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={14} /> Back
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto px-8 py-8">
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              provision.mutate(form);
            }}
            className="space-y-6"
          >
            <section>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#166A50] mb-4">
                Organisation
              </p>
              <Field label="Organisation Name" required>
                <input
                  value={form.organisationName}
                  onChange={(e) => set("organisationName", e.target.value)}
                  placeholder="Acme Kenya Ltd"
                  required
                  maxLength={200}
                  className={INPUT}
                />
              </Field>
            </section>

            <section>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#166A50] mb-4">
                Admin Contact
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" required>
                  <input
                    value={form.adminFirstName}
                    onChange={(e) => set("adminFirstName", e.target.value)}
                    required
                    maxLength={100}
                    className={INPUT}
                    placeholder="Jane"
                  />
                </Field>
                <Field label="Last Name" required>
                  <input
                    value={form.adminLastName}
                    onChange={(e) => set("adminLastName", e.target.value)}
                    required
                    maxLength={100}
                    className={INPUT}
                    placeholder="Wanjiru"
                  />
                </Field>
                <Field label="Admin Email" required>
                  <input
                    type="email"
                    value={form.adminEmail}
                    onChange={(e) => set("adminEmail", e.target.value)}
                    required
                    className={INPUT}
                    placeholder="admin@acme.co.ke"
                  />
                </Field>
                <Field label="Admin Phone" required>
                  <input
                    value={form.adminPhone}
                    onChange={(e) => set("adminPhone", e.target.value)}
                    required
                    pattern="^(\+254|0)7\d{8}$"
                    className={INPUT}
                    placeholder="+254712345678"
                  />
                </Field>
              </div>
            </section>

            <section>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#166A50] mb-4">
                Licence
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Plan" required>
                  <select
                    value={form.planId}
                    onChange={(e) => set("planId", e.target.value)}
                    required
                    className={INPUT}
                  >
                    <option value="">Select plan…</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — KES {p.monthlyPrice.toLocaleString()}/mo
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Billing Cycle" required>
                  <select
                    value={form.billingCycle}
                    onChange={(e) =>
                      set(
                        "billingCycle",
                        e.target.value as "MONTHLY" | "ANNUAL"
                      )
                    }
                    className={INPUT}
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="ANNUAL">Annual</option>
                  </select>
                </Field>
                <Field label="Seat Count" required>
                  <input
                    type="number"
                    min={1}
                    value={form.seatCount}
                    onChange={(e) => set("seatCount", Number(e.target.value))}
                    required
                    className={INPUT}
                  />
                </Field>
                <Field label="Agreed Price (KES)" required>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={form.agreedPriceKes}
                    onChange={(e) =>
                      set("agreedPriceKes", Number(e.target.value))
                    }
                    required
                    className={INPUT}
                  />
                </Field>
                <Field label="Trial Days">
                  <input
                    type="number"
                    min={0}
                    max={90}
                    value={form.trialDays}
                    onChange={(e) => set("trialDays", Number(e.target.value))}
                    className={INPUT}
                  />
                </Field>
              </div>
            </section>

            <button
              type="submit"
              disabled={provision.isPending}
              className="w-full bg-[#E8A020] hover:bg-[#C98510] disabled:opacity-50 text-[#02110C] font-bold text-[13.5px] h-10 rounded-lg transition-colors"
            >
              {provision.isPending ? "Provisioning…" : "Provision Tenant"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
