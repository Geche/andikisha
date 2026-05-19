"use client";

import { useState, useEffect, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, AlertTriangle } from "lucide-react";
import {
  PageHeader,
  FormField,
  Input,
  Select,
  Button,
  InlineAlert,
  Spinner,
  useToast,
} from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PlanOption {
  id: string;
  name: string;
  tier: string;
  monthlyPrice: number;
  currency: string;
}

interface ProvisionedTenant {
  tenantId: string;
  organisationName: string;
  licenceKey: string;
  licenceStatus: string;
  planName: string;
  adminEmail: string;
  temporaryPassword: string;
  seatCount: number;
  endDate: string | null;
}

interface FormErrors {
  organisationName?: string;
  adminEmail?: string;
  adminFirstName?: string;
  adminLastName?: string;
  adminPhone?: string;
  planId?: string;
  billingCycle?: string;
  seatCount?: string;
  agreedPriceKes?: string;
  trialDays?: string;
  _global?: string;
}

// ─── Success Modal ────────────────────────────────────────────────────────────

function SuccessModal({
  result,
  onDone,
}: {
  result: ProvisionedTenant;
  onDone: () => void;
}) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(result.temporaryPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  function fmtDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "numeric", month: "short", year: "numeric",
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" />
      <div className="relative w-full max-w-lg mx-4 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 flex flex-col gap-5">
        {/* Header */}
        <div>
          <h2 className="text-[20px] font-bold text-near-black leading-tight">
            Tenant Provisioned
          </h2>
          <p className="text-[13px] text-neutral-500 mt-1">
            {result.organisationName} has been set up successfully.
          </p>
        </div>

        {/* Summary */}
        <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-[13px]">
          <dt className="text-neutral-500">Plan</dt>
          <dd className="font-semibold text-near-black">{result.planName}</dd>
          <dt className="text-neutral-500">Licence status</dt>
          <dd className="font-semibold text-near-black">
            {result.licenceStatus.charAt(0) + result.licenceStatus.slice(1).toLowerCase()}
          </dd>
          <dt className="text-neutral-500">Seats</dt>
          <dd className="font-semibold text-near-black">{result.seatCount}</dd>
          <dt className="text-neutral-500">End date</dt>
          <dd className="font-semibold text-near-black">{fmtDate(result.endDate)}</dd>
          <dt className="text-neutral-500">Admin email</dt>
          <dd className="font-semibold text-near-black truncate">{result.adminEmail}</dd>
        </dl>

        {/* Password block */}
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
                <>
                  <Check size={13} className="text-brand-600" />
                  <span className="text-brand-700">Copied!</span>
                </>
              ) : (
                <>
                  <Copy size={13} className="text-neutral-500" />
                  <span className="text-neutral-700">Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Warning */}
        <div className="flex items-start gap-2.5 rounded-xl bg-amber-light border border-amber px-4 py-3">
          <AlertTriangle size={15} className="text-amber flex-shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-amber-text leading-relaxed">
            This password will not be shown again. The tenant admin will receive it via email
            and must change it on first login. Share it securely if needed.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-1">
          <Button variant="secondary" onClick={() => window.location.assign("/tenants/new")}>
            Provision Another
          </Button>
          <Button onClick={onDone}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PHONE_RE = /^(\+254|0)7\d{8}$/;

function validate(fields: {
  organisationName: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminPhone: string;
  planId: string;
  billingCycle: string;
  seatCount: string;
  agreedPriceKes: string;
  trialDays: string;
}): FormErrors {
  const e: FormErrors = {};
  if (!fields.organisationName.trim()) e.organisationName = "Organisation name is required";
  if (!fields.adminEmail.trim())       e.adminEmail = "Admin email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.adminEmail)) e.adminEmail = "Enter a valid email address";
  if (!fields.adminFirstName.trim())   e.adminFirstName = "First name is required";
  if (!fields.adminLastName.trim())    e.adminLastName = "Last name is required";
  if (!fields.adminPhone.trim())       e.adminPhone = "Phone number is required";
  else if (!PHONE_RE.test(fields.adminPhone.trim())) e.adminPhone = "Use format 07XXXXXXXX or +2547XXXXXXXX";
  if (!fields.planId)                  e.planId = "Select a plan";
  if (!fields.billingCycle)            e.billingCycle = "Select a billing cycle";
  const seats = parseInt(fields.seatCount, 10);
  if (!fields.seatCount || isNaN(seats) || seats < 1) e.seatCount = "Seat count must be at least 1";
  const price = parseFloat(fields.agreedPriceKes);
  if (!fields.agreedPriceKes || isNaN(price) || price < 0) e.agreedPriceKes = "Enter a valid price (0 or more)";
  const trial = parseInt(fields.trialDays, 10);
  if (isNaN(trial) || trial < 0) e.trialDays = "Trial days cannot be negative";
  return e;
}

export default function ProvisionTenantPage() {
  const router = useRouter();
  const toast = useToast();

  // Form fields
  const [organisationName, setOrganisationName] = useState("");
  const [adminEmail, setAdminEmail]             = useState("");
  const [adminFirstName, setAdminFirstName]     = useState("");
  const [adminLastName, setAdminLastName]       = useState("");
  const [adminPhone, setAdminPhone]             = useState("");
  const [planId, setPlanId]                     = useState("");
  const [billingCycle, setBillingCycle]         = useState("MONTHLY");
  const [seatCount, setSeatCount]               = useState("5");
  const [agreedPriceKes, setAgreedPriceKes]     = useState("");
  const [trialDays, setTrialDays]               = useState("0");

  const [errors, setErrors]       = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult]       = useState<ProvisionedTenant | null>(null);

  // Fetch available plans
  const { data: plans = [], isLoading: plansLoading, isError: plansError } =
    useQuery<PlanOption[]>({
      queryKey: ["plans"],
      queryFn: () => apiClient.get("/api/v1/plans").then((r) => r.data),
      staleTime: 5 * 60_000,
    });

  // Pre-fill agreedPriceKes when plan changes
  useEffect(() => {
    const selected = plans.find((p) => p.id === planId);
    if (selected) {
      setAgreedPriceKes(String(selected.monthlyPrice));
    }
  }, [planId, plans]);

  // Annual reference price
  const selectedPlan = plans.find((p) => p.id === planId);
  const annualHint =
    selectedPlan && billingCycle === "ANNUAL"
      ? `Reference: KES ${(selectedPlan.monthlyPrice * 12).toLocaleString("en-KE")} (monthly × 12)`
      : undefined;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate({
      organisationName, adminEmail, adminFirstName, adminLastName,
      adminPhone, planId, billingCycle, seatCount, agreedPriceKes, trialDays,
    });
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      const res = await apiClient.post("/api/v1/super-admin/tenants", {
        organisationName,
        adminEmail,
        adminFirstName,
        adminLastName,
        adminPhone,
        planId,
        billingCycle,
        seatCount: parseInt(seatCount, 10),
        agreedPriceKes: parseFloat(agreedPriceKes),
        trialDays: parseInt(trialDays, 10),
      });
      setResult(res.data as ProvisionedTenant);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setErrors({ _global: "A tenant with this email or organisation name already exists." });
      } else if (status === 400) {
        setErrors({ _global: "Validation failed. Check the fields and try again." });
      } else {
        setErrors({ _global: "An unexpected error occurred. Please try again." });
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleDone() {
    if (result) {
      toast(`Tenant created. Credentials sent to ${result.adminEmail}.`);
      router.push(`/tenants/${result.tenantId}`);
    }
  }

  return (
    <>
      <PageHeader title="Provision Tenant" />

      <div className="px-8 py-8 flex justify-center">
        <div className="w-full max-w-2xl">
          {plansError && (
            <InlineAlert variant="error" className="mb-6">
              Could not load plans. The form cannot be submitted until plans are available.
            </InlineAlert>
          )}
          {errors._global && (
            <InlineAlert variant="error" className="mb-6">
              {errors._global}
            </InlineAlert>
          )}

          <form onSubmit={handleSubmit} noValidate>
            {/* Section 1 — Organisation */}
            <section className="bg-surface border border-neutral-200 rounded-xl p-6 mb-5">
              <h2 className="text-[13px] font-semibold uppercase tracking-wide text-neutral-400 mb-4">
                Organisation
              </h2>
              <FormField
                label="Organisation name"
                htmlFor="organisationName"
                required
                error={errors.organisationName}
              >
                <Input
                  id="organisationName"
                  value={organisationName}
                  onChange={(e) => setOrganisationName(e.target.value)}
                  placeholder="Acme Corp"
                  maxLength={200}
                  error={!!errors.organisationName}
                />
              </FormField>
            </section>

            {/* Section 2 — Admin Account */}
            <section className="bg-surface border border-neutral-200 rounded-xl p-6 mb-5">
              <h2 className="text-[13px] font-semibold uppercase tracking-wide text-neutral-400 mb-4">
                Admin Account
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <FormField label="First name" htmlFor="adminFirstName" required error={errors.adminFirstName}>
                  <Input
                    id="adminFirstName"
                    value={adminFirstName}
                    onChange={(e) => setAdminFirstName(e.target.value)}
                    placeholder="Jane"
                    maxLength={100}
                    error={!!errors.adminFirstName}
                  />
                </FormField>
                <FormField label="Last name" htmlFor="adminLastName" required error={errors.adminLastName}>
                  <Input
                    id="adminLastName"
                    value={adminLastName}
                    onChange={(e) => setAdminLastName(e.target.value)}
                    placeholder="Wanjiru"
                    maxLength={100}
                    error={!!errors.adminLastName}
                  />
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField label="Email address" htmlFor="adminEmail" required error={errors.adminEmail}>
                  <Input
                    id="adminEmail"
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="jane@acme.co.ke"
                    error={!!errors.adminEmail}
                  />
                </FormField>
                <FormField
                  label="Phone number"
                  htmlFor="adminPhone"
                  required
                  hint="Format: 07XXXXXXXX or +2547XXXXXXXX"
                  error={errors.adminPhone}
                >
                  <Input
                    id="adminPhone"
                    type="tel"
                    value={adminPhone}
                    onChange={(e) => setAdminPhone(e.target.value)}
                    placeholder="0712345678"
                    error={!!errors.adminPhone}
                  />
                </FormField>
              </div>
            </section>

            {/* Section 3 — Licence */}
            <section className="bg-surface border border-neutral-200 rounded-xl p-6 mb-6">
              <h2 className="text-[13px] font-semibold uppercase tracking-wide text-neutral-400 mb-4">
                Licence
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <FormField label="Plan" htmlFor="planId" required error={errors.planId}>
                  <Select
                    id="planId"
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    error={!!errors.planId}
                    disabled={plansLoading || plansError}
                  >
                    <option value="">
                      {plansLoading ? "Loading plans…" : "Select a plan"}
                    </option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} — KES {Number(p.monthlyPrice).toLocaleString("en-KE")}/mo
                      </option>
                    ))}
                  </Select>
                </FormField>
                <FormField label="Billing cycle" htmlFor="billingCycle" required error={errors.billingCycle}>
                  <Select
                    id="billingCycle"
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    error={!!errors.billingCycle}
                  >
                    <option value="MONTHLY">Monthly</option>
                    <option value="ANNUAL">Annual</option>
                  </Select>
                </FormField>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <FormField label="Seat count" htmlFor="seatCount" required error={errors.seatCount}>
                  <Input
                    id="seatCount"
                    type="number"
                    min={1}
                    value={seatCount}
                    onChange={(e) => setSeatCount(e.target.value)}
                    error={!!errors.seatCount}
                  />
                </FormField>
                <FormField
                  label="Agreed price (KES)"
                  htmlFor="agreedPriceKes"
                  required
                  hint={annualHint}
                  error={errors.agreedPriceKes}
                >
                  <Input
                    id="agreedPriceKes"
                    type="number"
                    min={0}
                    step="0.01"
                    value={agreedPriceKes}
                    onChange={(e) => setAgreedPriceKes(e.target.value)}
                    placeholder="0.00"
                    error={!!errors.agreedPriceKes}
                  />
                </FormField>
              </div>
              <FormField
                label="Trial days"
                htmlFor="trialDays"
                hint="0 = no trial (tenant activates immediately). Enter days for a trial period."
                error={errors.trialDays}
              >
                <Input
                  id="trialDays"
                  type="number"
                  min={0}
                  value={trialDays}
                  onChange={(e) => setTrialDays(e.target.value)}
                  className="max-w-[160px]"
                  error={!!errors.trialDays}
                />
              </FormField>
            </section>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push("/tenants")}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting || plansLoading || !!plansError}
              >
                {submitting ? (
                  <>
                    <Spinner size="sm" className="mr-1.5" />
                    Provisioning…
                  </>
                ) : (
                  "Provision Tenant"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Success modal */}
      {result && <SuccessModal result={result} onDone={handleDone} />}
    </>
  );
}
