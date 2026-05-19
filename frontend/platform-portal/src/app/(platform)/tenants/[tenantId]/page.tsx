"use client";

import { use, useState, type FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Building2, AlertTriangle, Check, Copy,
  ToggleLeft, ToggleRight, Plus, ChevronRight,
  ShieldAlert, ShieldCheck, Timer, KeyRound, XCircle,
} from "lucide-react";
import {
  PageHeader, Button, Badge, Spinner, InlineAlert,
  FormField, Input, Select, Textarea, useToast,
} from "@andikisha/ui";
import type { BadgeStatus } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { KNOWN_FEATURE_FLAGS } from "@/lib/featureFlagsRegistry";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LicenceInfo {
  licenceId: string;
  planId: string;
  planName: string;
  billingCycle: string;
  seatCount: number;
  agreedPriceKes: number;
  currency: string;
  startDate: string | null;
  endDate: string | null;
  status: string;
  suspendedAt: string | null;
  createdBy: string;
}

interface TenantDetail {
  tenantId: string;
  organisationName: string;
  status: string;
  createdAt: string;
  adminEmail: string;
  adminPhone: string | null;
  kraPin: string | null;
  nssfNumber: string | null;
  shifNumber: string | null;
  payFrequency: string | null;
  payDay: number | null;
  suspensionReason: string | null;
  trialEndsAt: string | null;
  currentLicence: LicenceInfo | null;
}

interface HistoryEntry {
  id: string;
  tenantId: string;
  licenceId: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string | null;
  changeReason: string | null;
  changedAt: string;
}

interface FeatureFlag {
  featureKey: string;
  enabled: boolean;
  description: string | null;
}

interface PasswordResetResult {
  tenantId: string;
  adminEmail: string;
  temporaryPassword: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status: string): BadgeStatus {
  switch (status.toUpperCase()) {
    case "ACTIVE":    return "approved";
    case "TRIAL":     return "calculating";
    case "SUSPENDED": return "cancelled";
    case "CANCELLED": return "cancelled";
    default:          return "draft";
  }
}

function fmtDate(iso: string | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", opts ?? {
    day: "numeric", month: "short", year: "numeric",
  });
}

function fmtDateTime(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatChangedBy(changedBy: string | null): string {
  if (!changedBy || changedBy === "SYSTEM") return "System";
  return changedBy.slice(0, 8) + "…";
}

function daysUntil(iso: string | null): number | null {
  if (!iso) return null;
  const diff = new Date(iso).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

function licenceStatusBadge(status: string): BadgeStatus {
  switch (status) {
    case "ACTIVE":       return "approved";
    case "TRIAL":        return "calculating";
    case "GRACE_PERIOD": return "calculating";
    case "SUSPENDED":    return "cancelled";
    case "EXPIRED":      return "cancelled";
    case "CANCELLED":    return "cancelled";
    default:             return "draft";
  }
}

// ─── ConfirmModal — base modal shell ──────────────────────────────────────────

function ConfirmModal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 flex flex-col gap-4">
        <h2 className="text-[18px] font-bold text-near-black">{title}</h2>
        {children}
      </div>
    </div>
  );
}

// ─── Password result modal ────────────────────────────────────────────────────

function PasswordResultModal({
  result,
  onClose,
}: {
  result: PasswordResetResult;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  function handleCopy() {
    navigator.clipboard.writeText(result.temporaryPassword).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/40" />
      <div className="relative w-full max-w-md mx-4 bg-white rounded-2xl shadow-2xl border border-neutral-200 p-6 flex flex-col gap-4">
        <h2 className="text-[18px] font-bold text-near-black">Password Reset</h2>
        <p className="text-[13px] text-neutral-500">New temporary password for <span className="font-semibold text-near-black">{result.adminEmail}</span></p>
        <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">Temporary Password</p>
          <div className="flex items-center gap-3">
            <code className="flex-1 font-mono text-[18px] font-bold text-near-black tracking-wider break-all">
              {result.temporaryPassword}
            </code>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 text-[12px] font-semibold bg-white hover:bg-neutral-100 transition-colors flex-shrink-0"
            >
              {copied ? <><Check size={13} className="text-brand-600" /><span className="text-brand-700">Copied!</span></> : <><Copy size={13} className="text-neutral-500" /><span className="text-neutral-700">Copy</span></>}
            </button>
          </div>
        </div>
        <div className="flex items-start gap-2.5 rounded-xl bg-amber-light border border-amber px-4 py-3">
          <AlertTriangle size={15} className="text-amber flex-shrink-0 mt-0.5" />
          <p className="text-[12.5px] text-amber-text leading-relaxed">
            This password will not be shown again. Share it securely with the admin. They must change it on next login.
          </p>
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Action modals ────────────────────────────────────────────────────────────

function SuspendModal({ orgName, onConfirm, onClose, loading, error }: {
  orgName: string; onConfirm: (reason: string) => void;
  onClose: () => void; loading: boolean; error: string | null;
}) {
  const [reason, setReason] = useState("");
  return (
    <ConfirmModal title={`Suspend ${orgName}`} onClose={onClose}>
      {error && <InlineAlert variant="error">{error}</InlineAlert>}
      <FormField label="Reason" htmlFor="suspend-reason" required hint="Reason is stored on the account and visible in history.">
        <Textarea
          id="suspend-reason"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Payment overdue — invoice INV-001 unpaid for 30 days"
          rows={3}
          maxLength={500}
          error={!reason.trim() && !!error}
        />
      </FormField>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="danger" disabled={loading || !reason.trim()} onClick={() => onConfirm(reason)}>
          {loading ? <><Spinner size="sm" className="mr-1.5" />Suspending…</> : "Suspend Tenant"}
        </Button>
      </div>
    </ConfirmModal>
  );
}

function ReactivateModal({ orgName, onConfirm, onClose, loading, error }: {
  orgName: string; onConfirm: () => void;
  onClose: () => void; loading: boolean; error: string | null;
}) {
  return (
    <ConfirmModal title={`Reactivate ${orgName}`} onClose={onClose}>
      {error && <InlineAlert variant="error">{error}</InlineAlert>}
      <p className="text-[13px] text-neutral-600">The tenant's licence will return to ACTIVE. They will regain access immediately.</p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button disabled={loading} onClick={onConfirm}>
          {loading ? <><Spinner size="sm" className="mr-1.5" />Reactivating…</> : "Reactivate"}
        </Button>
      </div>
    </ConfirmModal>
  );
}

function ExtendTrialModal({ orgName, trialEndsAt, onConfirm, onClose, loading, error }: {
  orgName: string; trialEndsAt: string | null;
  onConfirm: (days: number) => void;
  onClose: () => void; loading: boolean; error: string | null;
}) {
  const [days, setDays] = useState("30");
  const daysNum = parseInt(days, 10);
  const currentEnd = trialEndsAt ? new Date(trialEndsAt) : new Date();
  const newEnd = !isNaN(daysNum) && daysNum > 0
    ? new Date(currentEnd.getTime() + daysNum * 86400000)
    : null;
  return (
    <ConfirmModal title={`Extend trial — ${orgName}`} onClose={onClose}>
      {error && <InlineAlert variant="error">{error}</InlineAlert>}
      <FormField
        label="Additional days"
        htmlFor="extend-days"
        required
        hint={`Current end: ${fmtDate(trialEndsAt)}${newEnd ? ` → New end: ${fmtDate(newEnd.toISOString())}` : ""}`}
      >
        <Input
          id="extend-days"
          type="number"
          min={1}
          max={90}
          value={days}
          onChange={(e) => setDays(e.target.value)}
          className="max-w-[120px]"
          error={isNaN(daysNum) || daysNum < 1 || daysNum > 90}
        />
      </FormField>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button disabled={loading || isNaN(daysNum) || daysNum < 1 || daysNum > 90} onClick={() => onConfirm(daysNum)}>
          {loading ? <><Spinner size="sm" className="mr-1.5" />Extending…</> : "Extend Trial"}
        </Button>
      </div>
    </ConfirmModal>
  );
}

function ResetPasswordModal({ adminEmail, onConfirm, onClose, loading, error }: {
  adminEmail: string; onConfirm: () => void;
  onClose: () => void; loading: boolean; error: string | null;
}) {
  return (
    <ConfirmModal title="Reset admin password" onClose={onClose}>
      {error && <InlineAlert variant="error">{error}</InlineAlert>}
      <p className="text-[13px] text-neutral-600">
        A new temporary password will be generated for <span className="font-semibold text-near-black">{adminEmail}</span>.
        Their current session will be terminated and they must change the password on next login.
        You will need to share the new password securely.
      </p>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button disabled={loading} onClick={onConfirm}>
          {loading ? <><Spinner size="sm" className="mr-1.5" />Resetting…</> : "Reset Password"}
        </Button>
      </div>
    </ConfirmModal>
  );
}

function CancelModal({ orgName, onConfirm, onClose, loading, error }: {
  orgName: string; onConfirm: () => void;
  onClose: () => void; loading: boolean; error: string | null;
}) {
  const [typed, setTyped] = useState("");
  const matches = typed === orgName;
  return (
    <ConfirmModal title="Cancel tenant account" onClose={onClose}>
      <InlineAlert variant="error">
        This action permanently cancels the tenant's account. It cannot be undone.
      </InlineAlert>
      {error && <InlineAlert variant="error">{error}</InlineAlert>}
      <FormField label={`Type "${orgName}" to confirm`} htmlFor="cancel-confirm" required>
        <Input
          id="cancel-confirm"
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={orgName}
          error={typed.length > 0 && !matches}
        />
      </FormField>
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="danger" disabled={loading || !matches} onClick={onConfirm}>
          {loading ? <><Spinner size="sm" className="mr-1.5" />Cancelling…</> : "Permanently Cancel Account"}
        </Button>
      </div>
    </ConfirmModal>
  );
}

// ─── Feature flag inline confirm ──────────────────────────────────────────────

function FlagToggleRow({
  featureKey,
  label,
  description,
  enabled,
  onToggle,
  pending,
}: {
  featureKey: string;
  label: string;
  description: string | null;
  enabled: boolean;
  onToggle: (key: string, enable: boolean) => void;
  pending: boolean;
}) {
  const [confirming, setConfirming] = useState(false);
  const Icon = enabled ? ToggleRight : ToggleLeft;

  function handleClick() {
    if (pending) return;
    setConfirming(true);
  }

  function handleConfirm() {
    setConfirming(false);
    onToggle(featureKey, !enabled);
  }

  return (
    <div className="flex items-center justify-between gap-4 py-2.5 border-b border-neutral-100 last:border-0">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold text-near-black">{label || featureKey}</p>
        {description && <p className="text-[12px] text-neutral-500 truncate">{description}</p>}
        {!description && label !== featureKey && (
          <p className="text-[11px] text-neutral-400 font-mono">{featureKey}</p>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {confirming && (
          <div className="flex items-center gap-1.5 text-[12px]">
            <span className="text-neutral-600">{enabled ? "Disable?" : "Enable?"}</span>
            <button onClick={handleConfirm} className="font-semibold text-brand-700 hover:underline">Yes</button>
            <button onClick={() => setConfirming(false)} className="text-neutral-400 hover:underline">No</button>
          </div>
        )}
        <button onClick={handleClick} disabled={pending} className="flex-shrink-0">
          {pending
            ? <Spinner size="sm" />
            : <Icon size={26} className={enabled ? "text-brand-600" : "text-neutral-300"} strokeWidth={1.5} />
          }
        </button>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type ModalType = "suspend" | "reactivate" | "extend-trial" | "reset-password" | "cancel" | null;

export default function TenantDetailPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = use(params);
  const router = useRouter();
  const toast = useToast();
  const qc = useQueryClient();

  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [passwordResult, setPasswordResult] = useState<PasswordResetResult | null>(null);
  const [pendingFlagKey, setPendingFlagKey] = useState<string | null>(null);
  const [customFlagKey, setCustomFlagKey] = useState("");
  const [addingFlag, setAddingFlag] = useState(false);

  // ── Data queries ────────────────────────────────────────────────────────────

  const { data, isLoading, isError } = useQuery<TenantDetail>({
    queryKey: ["tenant", tenantId],
    queryFn: () => apiClient.get(`/api/v1/super-admin/tenants/${tenantId}`).then((r) => r.data),
    retry: false,
  });

  const { data: history = [], isLoading: historyLoading } = useQuery<HistoryEntry[]>({
    queryKey: ["tenant-history", tenantId],
    queryFn: () =>
      apiClient.get(`/api/v1/super-admin/tenants/${tenantId}/licences/history`).then((r) => r.data),
    enabled: !!data,
  });

  const { data: flags = [], isLoading: flagsLoading } = useQuery<FeatureFlag[]>({
    queryKey: ["tenant-flags", tenantId],
    queryFn: () =>
      apiClient.get(`/api/v1/super-admin/tenants/${tenantId}/feature-flags`).then((r) => r.data),
    enabled: !!data,
  });

  // ── Mutations ───────────────────────────────────────────────────────────────

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["tenant", tenantId] });
    qc.invalidateQueries({ queryKey: ["tenant-history", tenantId] });
    qc.invalidateQueries({ queryKey: ["tenants"] });
  }

  const suspendMut = useMutation({
    mutationFn: (reason: string) =>
      apiClient.patch(`/api/v1/super-admin/tenants/${tenantId}/suspend`, { reason }),
    onSuccess: () => {
      invalidate();
      setActiveModal(null);
      toast(`Suspended ${data?.organisationName}`);
    },
    onError: () => setActionError("Suspension failed. The tenant may already be suspended."),
  });

  const reactivateMut = useMutation({
    mutationFn: () =>
      apiClient.patch(`/api/v1/super-admin/tenants/${tenantId}/reactivate`),
    onSuccess: () => {
      invalidate();
      setActiveModal(null);
      toast(`Reactivated ${data?.organisationName}`);
    },
    onError: () => setActionError("Reactivation failed. The tenant may not be in a suspendable state."),
  });

  const extendTrialMut = useMutation({
    mutationFn: (additionalDays: number) =>
      apiClient.patch(`/api/v1/super-admin/tenants/${tenantId}/extend-trial`, { additionalDays }),
    onSuccess: (res) => {
      invalidate();
      setActiveModal(null);
      const newEnd = res.data?.endDate ? fmtDate(res.data.endDate) : "the new date";
      toast(`Trial extended to ${newEnd}`);
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      setActionError(status === 400 ? "Additional days must be between 1 and 90." : "Extension failed. Try again.");
    },
  });

  const resetPasswordMut = useMutation({
    mutationFn: () =>
      apiClient.post(`/api/v1/super-admin/tenants/${tenantId}/admin-password-reset`),
    onSuccess: (res) => {
      setActiveModal(null);
      setPasswordResult(res.data as PasswordResetResult);
    },
    onError: () => setActionError("Password reset failed. The auth service may be unavailable."),
  });

  const cancelMut = useMutation({
    mutationFn: async () => {
      const t0 = performance.now();
      const result = await apiClient.delete(`/api/v1/super-admin/tenants/${tenantId}`);
      // Issue 1 timing instrumentation — remove after baseline established
      console.log(`[cancel] duration: ${Math.round(performance.now() - t0)}ms`);
      return result;
    },
    onSuccess: () => {
      invalidate();
      setActiveModal(null);
      toast(`Cancelled ${data?.organisationName}`);
    },
    onError: () => setActionError("Cancellation failed. The account may already be cancelled."),
  });

  async function toggleFlag(key: string, enable: boolean) {
    setPendingFlagKey(key);
    try {
      const action = enable ? "enable" : "disable";
      await apiClient.put(`/api/v1/super-admin/tenants/${tenantId}/feature-flags/${key}/${action}`);
      qc.invalidateQueries({ queryKey: ["tenant-flags", tenantId] });
    } finally {
      setPendingFlagKey(null);
    }
  }

  async function addCustomFlag(e: FormEvent) {
    e.preventDefault();
    const key = customFlagKey.trim();
    if (!key) return;
    setAddingFlag(true);
    try {
      await apiClient.put(`/api/v1/super-admin/tenants/${tenantId}/feature-flags/${key}/enable`);
      qc.invalidateQueries({ queryKey: ["tenant-flags", tenantId] });
      setCustomFlagKey("");
    } finally {
      setAddingFlag(false);
    }
  }

  // ── Derived state ───────────────────────────────────────────────────────────

  function openModal(type: ModalType) {
    setActionError(null);
    setActiveModal(type);
  }

  const status = data?.status?.toUpperCase() ?? "";
  const orgName = data?.organisationName ?? (isLoading ? "Loading…" : "Tenant");
  const isCancelled = status === "CANCELLED";
  const isSuspended = status === "SUSPENDED";
  const isActive = status === "ACTIVE";
  const isTrial = status === "TRIAL";
  const trialDays = daysUntil(data?.trialEndsAt ?? null);

  // Merge registry flags with flags from DB
  const registryKeys = new Set(KNOWN_FEATURE_FLAGS.map((f) => f.key));
  const dbFlagMap = new Map(flags.map((f) => [f.featureKey, f]));
  const registryRows = KNOWN_FEATURE_FLAGS.map((kf) => ({
    featureKey: kf.key,
    label: kf.label,
    description: kf.description,
    enabled: dbFlagMap.get(kf.key)?.enabled ?? false,
  }));
  const customRows = flags
    .filter((f) => !registryKeys.has(f.featureKey))
    .map((f) => ({ featureKey: f.featureKey, label: f.featureKey, description: f.description, enabled: f.enabled }));

  // ── Render ──────────────────────────────────────────────────────────────────

  if (isError) {
    return (
      <>
        <PageHeader title="Tenant" actions={<Button variant="secondary" size="sm" onClick={() => router.push("/tenants")}><ArrowLeft size={13} className="mr-1" />All Tenants</Button>} />
        <div className="px-8 py-8"><InlineAlert variant="error">Tenant not found or failed to load. It may have been deleted.</InlineAlert></div>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={orgName}
        subtitle={`ID: ${tenantId.slice(0, 8)}…`}
        actions={
          <Button variant="secondary" size="sm" onClick={() => router.push("/tenants")}>
            <ArrowLeft size={13} className="mr-1" />All Tenants
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : data ? (
        <div className="px-8 py-6 max-w-5xl mx-auto flex flex-col gap-5">

          {/* ── Section 1: Identity Strip ─────────────────────────────────── */}
          <div className="bg-surface border border-neutral-200 rounded-xl overflow-hidden">
            <div className="p-5 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                <Building2 size={18} className="text-brand-700" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[16px] font-bold text-near-black truncate">{data.organisationName}</p>
                <p className="text-[12px] text-neutral-500 truncate">{data.adminEmail}</p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {data.adminPhone && (
                  <span className="text-[12px] text-neutral-500 hidden sm:block">{data.adminPhone}</span>
                )}
                <Badge status={statusBadge(status)}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </Badge>
              </div>
            </div>
            <div className="px-5 pb-3 flex items-center gap-6 text-[12px] text-neutral-400">
              <span>Tenant ID: <span className="font-mono text-neutral-600" title={tenantId}>{tenantId.slice(0, 8)}…</span></span>
              <span>Created: {fmtDate(data.createdAt)}</span>
            </div>

            {/* Suspension reason banner */}
            {isSuspended && data.suspensionReason && (
              <div className="flex items-start gap-2.5 bg-red-50 border-t border-error px-5 py-3">
                <ShieldAlert size={14} className="text-error flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-[12px] font-semibold text-error">Suspension reason: </span>
                  <span className="text-[12px] text-error">{data.suspensionReason}</span>
                </div>
              </div>
            )}

            {/* Trial expiry notice */}
            {isTrial && data.trialEndsAt && (
              <div className="flex items-center gap-2.5 bg-amber-light border-t border-amber px-5 py-2.5">
                <Timer size={14} className="text-amber flex-shrink-0" />
                <span className="text-[12px] text-amber-text font-medium">
                  Trial ends {fmtDate(data.trialEndsAt)}
                  {trialDays !== null && ` (${trialDays <= 0 ? "expired" : `${trialDays} day${trialDays === 1 ? "" : "s"} remaining`})`}
                </span>
              </div>
            )}
          </div>

          {/* ── Section 3: Lifecycle Actions ──────────────────────────────── */}
          <div className="bg-surface border border-neutral-200 rounded-xl p-5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400 mb-3">Actions</p>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Routine actions — left */}
              {isTrial && (
                <Button variant="secondary" size="sm" onClick={() => openModal("extend-trial")}>
                  <Timer size={14} className="mr-1" />Extend trial
                </Button>
              )}
              <Button variant="secondary" size="sm" onClick={() => openModal("reset-password")}>
                <KeyRound size={14} className="mr-1" />Reset admin password
              </Button>

              {/* Status-change actions — middle */}
              {(isActive || isTrial) && !isCancelled && (
                <Button variant="danger" size="sm" onClick={() => openModal("suspend")}>
                  <ShieldAlert size={14} className="mr-1" />Suspend
                </Button>
              )}
              {isSuspended && (
                <Button size="sm" onClick={() => openModal("reactivate")}>
                  <ShieldCheck size={14} className="mr-1" />Reactivate
                </Button>
              )}

              {/* Destructive — right, separated */}
              {!isCancelled && (
                <>
                  <span className="h-6 w-px bg-neutral-200 ml-2" aria-hidden />
                  <Button variant="danger" size="sm" onClick={() => openModal("cancel")} className="ml-2">
                    <XCircle size={14} className="mr-1" />Cancel tenant
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* ── Sections 2 + 6: Licence card + Statutory info ─────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-8 gap-5">
            {/* Licence card */}
            <div className="lg:col-span-5 bg-surface border border-neutral-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Current Licence</p>
                <span
                  className="flex items-center gap-1 text-[12px] font-semibold text-neutral-300 cursor-not-allowed opacity-60"
                  title="Coming soon"
                >
                  Manage licence <ChevronRight size={12} />
                </span>
              </div>
              {data.currentLicence ? (
                <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-[13px]">
                  <dt className="text-neutral-500">Plan</dt>
                  <dd className="font-semibold text-near-black">{data.currentLicence.planName}</dd>
                  <dt className="text-neutral-500">Status</dt>
                  <dd><Badge status={licenceStatusBadge(data.currentLicence.status)}>{data.currentLicence.status}</Badge></dd>
                  <dt className="text-neutral-500">Seats</dt>
                  <dd className="font-semibold text-near-black">{data.currentLicence.seatCount}</dd>
                  <dt className="text-neutral-500">Billing</dt>
                  <dd className="font-semibold text-near-black">{data.currentLicence.billingCycle}</dd>
                  <dt className="text-neutral-500">Agreed price</dt>
                  <dd className="font-semibold text-near-black font-mono">KES {Number(data.currentLicence.agreedPriceKes).toLocaleString("en-KE")}</dd>
                  <dt className="text-neutral-500">Start date</dt>
                  <dd className="text-near-black">{fmtDate(data.currentLicence.startDate)}</dd>
                  <dt className="text-neutral-500">End date</dt>
                  <dd className="text-near-black">{fmtDate(data.currentLicence.endDate)}</dd>
                  {data.currentLicence.suspendedAt && (
                    <>
                      <dt className="text-neutral-500">Suspended at</dt>
                      <dd className="text-near-black">{fmtDateTime(data.currentLicence.suspendedAt)}</dd>
                    </>
                  )}
                </dl>
              ) : (
                <InlineAlert variant="error">No licence found for this tenant.</InlineAlert>
              )}
            </div>

            {/* Statutory info */}
            <div className="lg:col-span-3 bg-surface border border-neutral-200 rounded-xl p-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400 mb-4">Statutory Information</p>
              <dl className="flex flex-col gap-3 text-[13px]">
                {[
                  ["KRA PIN", data.kraPin],
                  ["NSSF No.", data.nssfNumber],
                  ["SHIF No.", data.shifNumber],
                  ["Pay frequency", data.payFrequency],
                  ["Pay day", data.payDay?.toString() ?? null],
                ].map(([label, value]) => (
                  <div key={label as string} className="flex justify-between gap-2">
                    <dt className="text-neutral-500 flex-shrink-0">{label}</dt>
                    <dd className={`font-semibold text-right truncate ${value ? "text-near-black" : "text-neutral-300"}`}>{value ?? "—"}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* ── Section 4: Licence History ────────────────────────────────── */}
          <div className="bg-surface border border-neutral-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100">
              <p className="text-[14px] font-bold text-near-black">Licence History</p>
            </div>
            {historyLoading ? (
              <div className="flex justify-center py-8"><Spinner /></div>
            ) : history.length === 0 ? (
              <p className="px-5 py-8 text-[13px] text-neutral-400 text-center">
                No licence transitions yet. History entries appear here when a licence is suspended, reactivated, extended, or cancelled.
              </p>
            ) : (
              <div className="divide-y divide-neutral-100">
                {history.map((entry) => (
                  <div key={entry.id} className="px-5 py-3 flex items-start gap-4">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-neutral-300 mt-1.5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge status={licenceStatusBadge(entry.previousStatus || "draft")}>{entry.previousStatus || "—"}</Badge>
                        <span className="text-[12px] text-neutral-400">→</span>
                        <Badge status={licenceStatusBadge(entry.newStatus)}>{entry.newStatus}</Badge>
                        {entry.changeReason && (
                          <span className="text-[12px] text-neutral-500 truncate max-w-[240px]">{entry.changeReason}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-[12px] text-neutral-500">{fmtDateTime(entry.changedAt)}</p>
                      <p
                        className="text-[11px] text-neutral-400 font-mono cursor-default"
                        title={entry.changedBy ?? ""}
                      >
                        {formatChangedBy(entry.changedBy)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Section 5: Feature Flags ──────────────────────────────────── */}
          <div className="bg-surface border border-neutral-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-neutral-100">
              <p className="text-[14px] font-bold text-near-black">Feature Flags</p>
            </div>
            {flagsLoading ? (
              <div className="flex justify-center py-6"><Spinner /></div>
            ) : (
              <div className="px-5 py-3">
                {registryRows.length === 0 && customRows.length === 0 && (
                  <p className="text-[13px] text-neutral-400 py-4 leading-relaxed">
                    No feature flags currently registered for the platform. As features ship with flag-gated rollouts, they will appear here. To toggle a specific flag for this tenant before it's added to the registry, use 'Add custom flag' below.
                  </p>
                )}

                {registryRows.length > 0 && (
                  <div className="mb-3">
                    {registryRows.map((row) => (
                      <FlagToggleRow
                        key={row.featureKey}
                        featureKey={row.featureKey}
                        label={row.label}
                        description={row.description}
                        enabled={row.enabled}
                        onToggle={toggleFlag}
                        pending={pendingFlagKey === row.featureKey}
                      />
                    ))}
                  </div>
                )}

                {customRows.length > 0 && (
                  <div className="mb-3">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400 py-2">Custom flags</p>
                    {customRows.map((row) => (
                      <FlagToggleRow
                        key={row.featureKey}
                        featureKey={row.featureKey}
                        label={row.featureKey}
                        description={row.description}
                        enabled={row.enabled}
                        onToggle={toggleFlag}
                        pending={pendingFlagKey === row.featureKey}
                      />
                    ))}
                  </div>
                )}

                {/* Add custom flag */}
                <form onSubmit={addCustomFlag} className="flex items-center gap-2 pt-3 border-t border-neutral-100">
                  <Input
                    value={customFlagKey}
                    onChange={(e) => setCustomFlagKey(e.target.value)}
                    placeholder="custom-flag-key"
                    className="flex-1 text-[13px] h-8 px-2.5 py-0"
                  />
                  <Button type="submit" size="sm" variant="secondary" disabled={addingFlag || !customFlagKey.trim()}>
                    {addingFlag ? <Spinner size="sm" /> : <><Plus size={13} className="mr-1" />Enable</>}
                  </Button>
                </form>
              </div>
            )}
          </div>

        </div>
      ) : null}

      {/* ── Modals ─────────────────────────────────────────────────────────── */}
      {activeModal === "suspend" && data && (
        <SuspendModal
          orgName={orgName}
          onConfirm={(reason) => suspendMut.mutate(reason)}
          onClose={() => setActiveModal(null)}
          loading={suspendMut.isPending}
          error={actionError}
        />
      )}
      {activeModal === "reactivate" && data && (
        <ReactivateModal
          orgName={orgName}
          onConfirm={() => reactivateMut.mutate()}
          onClose={() => setActiveModal(null)}
          loading={reactivateMut.isPending}
          error={actionError}
        />
      )}
      {activeModal === "extend-trial" && data && (
        <ExtendTrialModal
          orgName={orgName}
          trialEndsAt={data.trialEndsAt}
          onConfirm={(days) => extendTrialMut.mutate(days)}
          onClose={() => setActiveModal(null)}
          loading={extendTrialMut.isPending}
          error={actionError}
        />
      )}
      {activeModal === "reset-password" && data && (
        <ResetPasswordModal
          adminEmail={data.adminEmail}
          onConfirm={() => resetPasswordMut.mutate()}
          onClose={() => setActiveModal(null)}
          loading={resetPasswordMut.isPending}
          error={actionError}
        />
      )}
      {activeModal === "cancel" && data && (
        <CancelModal
          orgName={orgName}
          onConfirm={() => cancelMut.mutate()}
          onClose={() => setActiveModal(null)}
          loading={cancelMut.isPending}
          error={actionError}
        />
      )}
      {passwordResult && (
        <PasswordResultModal
          result={passwordResult}
          onClose={() => setPasswordResult(null)}
        />
      )}
    </>
  );
}
