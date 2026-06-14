"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Pencil, Check, X, Upload, KeyRound } from "lucide-react";
import { PageHeader, useToast, useCurrentUser, RoleBadge } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import type { AxiosError } from "axios";
import Link from "next/link";
import { useWorkspace } from "@/hooks/useWorkspace";

// Shared profile content, rendered by both /my/profile (employee shell) and
// /admin/profile (admin shell). Only the surrounding shell differs; this component
// is shell-agnostic and handles the no-employee-record case gracefully (R3-2c).

// ─── Types ───────────────────────────────────────────────────────────────────

interface EmployeeProfile {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;           // work email (tier-2)
  phoneNumber: string;            // tier-1
  personalEmail: string | null;   // tier-1
  emergencyContactName: string | null;  // tier-1
  emergencyContactPhone: string | null; // tier-1
  avatarUrl: string | null;       // tier-1
  departmentName: string | null;
  positionTitle: string | null;
  employmentType: string;
  status: string;
  hireDate: string | null;
  // tier-2 read-only fields
  nationalId: string;
  kraPin: string;
  nhifNumber: string | null;
  nssfNumber: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankBranch: string | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function maskAccount(acct: string | null | undefined): string {
  if (!acct) return "—";
  return acct.length > 4 ? `••••${acct.slice(-4)}` : "••••";
}

function formatDate(s: string | null | undefined): string {
  if (!s) return "—";
  return new Date(s).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

// ─── Inline editable field ───────────────────────────────────────────────────

function EditableField({
  label,
  value,
  onSave,
  type = "text",
  placeholder,
  disabled,
}: {
  label: string;
  value: string | null | undefined;
  onSave: (v: string) => Promise<void>;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await onSave(draft);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between py-3 border-b border-neutral-50 last:border-0 group">
        <div>
          <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-0.5">{label}</p>
          <p className="text-[13.5px] font-medium text-near-black">{value || "—"}</p>
        </div>
        {!disabled && (
          <button
            onClick={() => { setDraft(value ?? ""); setEditing(true); }}
            className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-[11.5px] text-brand-700 hover:text-brand-900 font-semibold transition-all"
          >
            <Pencil size={11} />
            Edit
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="py-3 border-b border-neutral-50 last:border-0">
      <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-1.5">{label}</p>
      <div className="flex items-center gap-2">
        <input
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={placeholder}
          disabled={saving}
          autoFocus
          className="flex-1 border border-neutral-200 rounded-lg px-3 py-2 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 disabled:opacity-60"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-9 w-9 flex items-center justify-center rounded-lg bg-brand-900 hover:bg-brand-950 text-white disabled:opacity-50 transition-colors"
        >
          <Check size={14} />
        </button>
        <button
          onClick={() => setEditing(false)}
          disabled={saving}
          className="h-9 w-9 flex items-center justify-center rounded-lg border border-neutral-200 text-neutral-500 hover:bg-neutral-50 disabled:opacity-50 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Read-only field ─────────────────────────────────────────────────────────

function ReadOnlyField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-neutral-50 last:border-0">
      <div>
        <p className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-[13.5px] font-medium text-near-black">{value || "—"}</p>
      </div>
    </div>
  );
}

// ─── Section card ─────────────────────────────────────────────────────────────

function SectionCard({
  title,
  children,
  badge,
}: {
  title: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
        <h2 className="text-[13.5px] font-semibold text-neutral-900">{title}</h2>
        {badge}
      </div>
      <div className="px-6">{children}</div>
    </div>
  );
}

// ─── Avatar upload ────────────────────────────────────────────────────────────

function AvatarUpload({
  avatarUrl,
  initials,
  onUpload,
}: {
  avatarUrl: string | null;
  initials: string;
  onUpload: (url: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast("Avatar must be 2 MB or smaller.", "error");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    try {
      const res = await apiClient.post<EmployeeProfile>("/api/v1/employees/me/avatar", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onUpload(res.data.avatarUrl ?? "");
      toast("Avatar updated", "success");
    } catch {
      toast("Upload failed. Check file type (JPEG/PNG/WEBP) and size.", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-shrink-0">
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-16 h-16 rounded-xl object-cover"
          />
        ) : (
          <div className="w-16 h-16 rounded-xl bg-brand-900 text-white flex items-center justify-center text-[22px] font-bold">
            {initials}
          </div>
        )}
        {uploading && (
          <div className="absolute inset-0 rounded-xl bg-black/30 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      <div>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="flex items-center gap-1.5 text-[12px] font-semibold text-brand-700 hover:text-brand-900 transition-colors disabled:opacity-50"
        >
          <Upload size={12} />
          {uploading ? "Uploading…" : "Change photo"}
        </button>
        <p className="text-[11px] text-neutral-400 mt-0.5">JPEG, PNG or WEBP · Max 2 MB</p>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFile}
        />
      </div>
    </div>
  );
}

// ─── Profile view ──────────────────────────────────────────────────────────────

export function ProfileView() {
  const workspace = useWorkspace();
  const toast = useToast();
  const queryClient = useQueryClient();

  // R3-2c: standalone admin-tier users have no linked employee record. Skip the
  // employee fetch and render a user-only view rather than an error state.
  const currentUser = useCurrentUser();
  const hasEmployee = !!currentUser?.employeeId;

  const { data: profile, isLoading, isError } = useQuery<EmployeeProfile>({
    queryKey: ["my-profile"],
    queryFn: () => apiClient.get<EmployeeProfile>("/api/v1/employees/me").then((r) => r.data),
    enabled: hasEmployee,
  });

  const updateMutation = useMutation<
    EmployeeProfile,
    AxiosError<{ message?: string }>,
    Partial<{ phoneNumber: string; personalEmail: string; emergencyContactName: string; emergencyContactPhone: string }>
  >({
    mutationFn: (body) =>
      apiClient.patch<EmployeeProfile>("/api/v1/employees/me/profile", body).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
    onError: (err) => {
      const msg = err.response?.data?.message ?? "Failed to save. Please try again.";
      toast(msg, "error");
    },
  });

  function save(field: string) {
    return async (value: string) => {
      await updateMutation.mutateAsync({ [field]: value });
      toast("Saved", "success");
    };
  }

  const initials = profile
    ? `${profile.firstName?.[0] ?? ""}${profile.lastName?.[0] ?? ""}`.toUpperCase()
    : "—";

  // R3-2c: standalone admin-tier users have no employee record. Show a user-only profile
  // (identity + password) and skip every employee-specific section — no error state.
  if (!hasEmployee) {
    const acctName = currentUser?.fullName?.trim() || currentUser?.email || "Account";
    const acctInitials = (currentUser?.fullName || currentUser?.email || "?").trim().slice(0, 2).toUpperCase();
    const acctRole = currentUser?.roles?.[0] ?? null;
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <PageHeader title="My Profile" subtitle="Your account details" />
        <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8 space-y-5">
          <div className="bg-white border border-neutral-200 rounded-xl p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-xl bg-brand-900 text-white flex items-center justify-center text-[22px] font-bold">
              {acctInitials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[18px] font-bold text-near-black truncate">{acctName}</p>
              {currentUser?.email && <p className="text-[13px] text-neutral-500 mt-0.5 truncate">{currentUser.email}</p>}
              {acctRole && <div className="mt-2"><RoleBadge role={acctRole} /></div>}
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-neutral-50 border border-neutral-200 rounded-xl px-5 py-3.5 text-[13px] text-neutral-600 max-w-2xl">
            <AlertTriangle size={15} className="flex-shrink-0 mt-0.5 text-neutral-400" />
            <span>
              This account isn’t linked to an employee record, so there’s no leave, attendance, or
              payroll information to show here. Contact your administrator if that seems wrong.
            </span>
          </div>

          {/* Password change is available to every account */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden max-w-2xl">
            <div className="px-6 py-4 border-b border-neutral-100">
              <h2 className="text-[13.5px] font-semibold text-neutral-900">Security</h2>
            </div>
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium text-near-black">Password</p>
                <p className="text-[12px] text-neutral-400 mt-0.5">Change your login password</p>
              </div>
              <Link
                href={`/${workspace}/my/change-password`}
                className="flex items-center gap-1.5 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-semibold text-[12.5px] h-9 px-3.5 rounded-lg transition-colors"
              >
                <KeyRound size={12} />
                Change password
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="My Profile"
        subtitle="Manage your personal details and view your employment information"
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8 space-y-5">
        {isError && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
            <AlertTriangle size={15} className="flex-shrink-0" />
            Could not load your profile.
          </div>
        )}

        {/* Identity card with avatar */}
        {!isLoading && profile && (
          <div className="bg-white border border-neutral-200 rounded-xl p-6 flex items-center gap-5">
            <AvatarUpload
              avatarUrl={profile.avatarUrl}
              initials={initials}
              onUpload={() => void queryClient.invalidateQueries({ queryKey: ["my-profile"] })}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[18px] font-bold text-near-black">
                {profile.firstName} {profile.lastName}
              </p>
              <p className="text-[13px] text-neutral-500 mt-0.5">
                {profile.positionTitle ?? "—"} · {profile.departmentName ?? "—"}
              </p>
              <p className="text-[12px] text-neutral-400 mt-0.5">
                Employee #{profile.employeeNumber}
              </p>
            </div>
            <span className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
              profile.status === "ACTIVE"
                ? "bg-brand-50 text-brand-800 border-brand-200"
                : "bg-neutral-50 text-neutral-500 border-neutral-200"
            }`}>
              {profile.status}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* ── TIER-1 — Editable by employee ────────────────────────────── */}
          <SectionCard
            title="Contact Details"
            badge={
              <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                Self-editable
              </span>
            }
          >
            <EditableField
              label="Phone Number"
              value={profile?.phoneNumber}
              type="tel"
              placeholder="+254712345678"
              onSave={save("phoneNumber")}
            />
            <EditableField
              label="Personal Email"
              value={profile?.personalEmail}
              type="email"
              placeholder="personal@example.com"
              onSave={save("personalEmail")}
            />
          </SectionCard>

          <SectionCard
            title="Emergency Contact"
            badge={
              <span className="text-[10px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full border border-brand-200">
                Self-editable
              </span>
            }
          >
            <EditableField
              label="Contact Name"
              value={profile?.emergencyContactName}
              placeholder="Full name"
              onSave={save("emergencyContactName")}
            />
            <EditableField
              label="Contact Phone"
              value={profile?.emergencyContactPhone}
              type="tel"
              placeholder="+254712345678"
              onSave={save("emergencyContactPhone")}
            />
          </SectionCard>

          {/* Password change */}
          <SectionCard title="Security">
            <div className="py-4 flex items-center justify-between">
              <div>
                <p className="text-[13.5px] font-medium text-near-black">Password</p>
                <p className="text-[12px] text-neutral-400 mt-0.5">Change your login password</p>
              </div>
              <Link
                href={`/${workspace}/my/change-password`}
                className="flex items-center gap-1.5 border border-neutral-200 text-neutral-700 hover:bg-neutral-50 font-semibold text-[12.5px] h-9 px-3.5 rounded-lg transition-colors"
              >
                <KeyRound size={12} />
                Change password
              </Link>
            </div>
          </SectionCard>

          {/* Employment (read-only) */}
          <SectionCard title="Employment">
            <ReadOnlyField label="Job Title" value={profile?.positionTitle} />
            <ReadOnlyField label="Department" value={profile?.departmentName} />
            <ReadOnlyField label="Employment Type" value={profile?.employmentType} />
            <ReadOnlyField label="Hire Date" value={formatDate(profile?.hireDate)} />
            <ReadOnlyField label="Status" value={profile?.status} />
          </SectionCard>

          {/* ── TIER-2 — HR-edit-only ─────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3 px-1">
              <AlertTriangle size={13} className="text-amber flex-shrink-0" />
              <p className="text-[12px] text-amber-text font-medium">
                To update the details below, contact your HR administrator.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <SectionCard title="Statutory Numbers">
                <ReadOnlyField label="National ID" value={profile?.nationalId} />
                <ReadOnlyField label="KRA PIN" value={profile?.kraPin} />
                <ReadOnlyField label="NSSF Number" value={profile?.nssfNumber} />
                <ReadOnlyField label="NHIF / SHIF Number" value={profile?.nhifNumber} />
              </SectionCard>

              <SectionCard title="Bank Details">
                <ReadOnlyField label="Bank Name" value={profile?.bankName} />
                <ReadOnlyField label="Account Number" value={maskAccount(profile?.bankAccountNumber)} />
                <ReadOnlyField label="Branch" value={profile?.bankBranch} />
              </SectionCard>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
