"use client";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Check, ShieldCheck, KeyRound } from "lucide-react";
import { PageHeader, Button, BaseModal, useToast, useCurrentUser } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";

interface RolePermissions {
  role: string;
  permissions: string[];
}
interface TenantUser {
  id: string;
  email: string;
  displayName: string | null;
  role: string;
  employeeId: string | null;
  lastLogin: string | null;
  active: boolean;
}
interface ResetResult {
  email: string;
  temporaryPassword: string;
}

// Assignable roles (HR legacy intentionally absent — the API also rejects it).
const ASSIGNABLE_ROLES = [
  { value: "EMPLOYEE", label: "Employee" },
  { value: "HR_OFFICER", label: "HR Officer" },
  { value: "PAYROLL_OFFICER", label: "Payroll Officer" },
  { value: "HR_MANAGER", label: "HR Manager" },
  { value: "LINE_MANAGER", label: "Line Manager" },
];
function roleLabel(role: string): string {
  return ASSIGNABLE_ROLES.find((r) => r.value === role)?.label
    ?? role.charAt(0) + role.slice(1).toLowerCase().replace(/_/g, " ");
}
function fmtLastLogin(iso: string | null): string {
  if (!iso) return "Never";
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-KE", { day: "2-digit", month: "short", year: "numeric" });
}

export default function UsersPage() {
  const queryClient = useQueryClient();
  const toast = useToast();
  const currentUser = useCurrentUser();
  const isAdmin = currentUser?.roles.includes("ADMIN") ?? false;
  const isHrManager = currentUser?.roles.includes("HR_MANAGER") ?? false;
  const canManage = isAdmin || isHrManager; // matches backend hasAnyRole('ADMIN','HR_MANAGER')

  const [assigning, setAssigning] = useState<TenantUser | null>(null);
  const [selectedRole, setSelectedRole] = useState("");
  const [resetting, setResetting] = useState<TenantUser | null>(null);
  const [resetResult, setResetResult] = useState<ResetResult | null>(null);
  const [showInactive, setShowInactive] = useState(false);

  const { data: rolesData, isLoading: rolesLoading } = useQuery<RolePermissions[]>({
    queryKey: ["users-roles"],
    queryFn: () => apiClient.get<RolePermissions[]>("/api/v1/auth/roles").then((r) => r.data),
    enabled: canManage,
  });
  const { data: usersData, isLoading: usersLoading } = useQuery<TenantUser[]>({
    queryKey: ["users-list"],
    queryFn: () => apiClient.get<TenantUser[]>("/api/v1/auth/users").then((r) => r.data),
    enabled: canManage,
  });

  const { columns, allPermissions } = useMemo(() => {
    const roles = rolesData ?? [];
    const cols = roles.filter((r) => r.permissions.length > 0).map((r) => r.role);
    const perms = Array.from(new Set(roles.flatMap((r) => r.permissions))).sort();
    return { columns: cols, allPermissions: perms };
  }, [rolesData]);

  const changeRole = useMutation<unknown, AxiosError<{ message?: string }>, { userId: string; role: string }>({
    mutationFn: ({ userId, role }) => apiClient.patch(`/api/v1/auth/users/${userId}/role`, { role }),
    onSuccess: () => {
      toast("Role updated", "success");
      setAssigning(null);
      void queryClient.invalidateQueries({ queryKey: ["users-list"] });
    },
    onError: (err) => toast(err.response?.data?.message ?? "Could not change role.", "error"),
  });

  const resetPassword = useMutation<ResetResult, AxiosError<{ message?: string }>, string>({
    mutationFn: (userId) =>
      apiClient.post<ResetResult>(`/api/v1/auth/users/${userId}/admin-password-reset`).then((r) => r.data),
    onSuccess: (data) => {
      setResetting(null);
      setResetResult(data);
    },
    onError: (err) => toast(err.response?.data?.message ?? "Could not reset password.", "error"),
  });

  const setActive = useMutation<unknown, AxiosError<{ message?: string }>, { userId: string; active: boolean }>({
    mutationFn: ({ userId, active }) => apiClient.patch(`/api/v1/auth/users/${userId}/active`, { active }),
    onSuccess: (_data, vars) => {
      toast(vars.active ? "User reactivated" : "User deactivated", "success");
      void queryClient.invalidateQueries({ queryKey: ["users-list"] });
    },
    // Surfaces the backend guard messages (last active admin / self-deactivation).
    onError: (err) => toast(err.response?.data?.message ?? "Could not update user.", "error"),
  });

  if (!canManage) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <PageHeader title="User management" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[14px] text-neutral-500">
            You need administrator or HR manager access to manage users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="User management" subtitle="Who has access, what they can do, and who holds each role." />

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6 space-y-8">
        {/* People — primary view */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[15px] font-semibold text-near-black">People</h2>
            <label className="flex items-center gap-2 text-[12.5px] text-neutral-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="rounded border-neutral-300 text-brand-700 focus:ring-brand-900/20"
              />
              Show inactive users
            </label>
          </div>
          {usersLoading ? (
            <p className="text-[13px] text-neutral-400">Loading…</p>
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
              <div className="grid grid-cols-[2fr_1fr_1fr_auto] gap-4 bg-neutral-50 border-b border-neutral-200 px-5 py-2.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
                <span>User</span><span>Role</span><span>Last sign-in</span><span className="text-right">Actions</span>
              </div>
              {(usersData ?? []).filter((u) => showInactive || u.active).map((u, i) => {
                const isPrivileged = u.role === "ADMIN" || u.role === "SUPER_ADMIN";
                const isSelf = currentUser?.userId === u.id;
                return (
                  <div key={u.id} className={`grid grid-cols-[2fr_1fr_1fr_auto] gap-4 items-center px-5 py-3 ${i > 0 ? "border-t border-neutral-100" : ""} ${!u.active ? "opacity-60" : ""}`}>
                    <div className="min-w-0">
                      <p className="text-[13.5px] text-near-black truncate">{u.displayName ?? u.email}</p>
                      {u.displayName && <p className="text-[12px] text-neutral-500 truncate">{u.email}</p>}
                    </div>
                    <span className="flex items-center gap-2">
                      <span className="text-[12.5px] font-medium text-ink-700 bg-neutral-100 px-2.5 py-0.5 rounded-full">
                        {roleLabel(u.role)}
                      </span>
                      {!u.active && (
                        <span className="text-[11px] font-semibold text-neutral-500 bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded-full">
                          Inactive
                        </span>
                      )}
                    </span>
                    <span className="text-[13px] text-neutral-500">{fmtLastLogin(u.lastLogin)}</span>
                    <div className="flex items-center justify-end gap-4">
                      {u.active ? (
                        <>
                          <button
                            onClick={() => setResetting(u)}
                            className="text-[13px] font-semibold text-brand-700 hover:underline inline-flex items-center gap-1"
                          >
                            <KeyRound size={13} aria-hidden="true" /> Reset password
                          </button>
                          {!isPrivileged && (
                            // Change role: ADMIN only (backend PATCH /role is ADMIN-only).
                            // Visible-but-disabled for HR_MANAGER with an explanatory tooltip.
                            <span title={isAdmin ? undefined : "Only an admin can change roles."}>
                              <button
                                onClick={() => { if (isAdmin) { setAssigning(u); setSelectedRole(u.role); } }}
                                disabled={!isAdmin}
                                className="text-[13px] font-semibold text-brand-700 hover:underline disabled:text-neutral-300 disabled:cursor-not-allowed disabled:no-underline"
                              >
                                Change role
                              </button>
                            </span>
                          )}
                          {/* Deactivate: ADMIN only (backend), never on your own account. */}
                          {isAdmin && !isSelf && (
                            <button
                              onClick={() => setActive.mutate({ userId: u.id, active: false })}
                              disabled={setActive.isPending}
                              className="text-[13px] font-semibold text-danger hover:underline disabled:opacity-50"
                            >
                              Deactivate
                            </button>
                          )}
                        </>
                      ) : (
                        // Reactivate: ADMIN only. No self case — a deactivated user can't sign in.
                        isAdmin && (
                          <button
                            onClick={() => setActive.mutate({ userId: u.id, active: true })}
                            disabled={setActive.isPending}
                            className="text-[13px] font-semibold text-brand-700 hover:underline disabled:opacity-50"
                          >
                            Reactivate
                          </button>
                        )
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Roles overview */}
        <section>
          <h2 className="text-[15px] font-semibold text-near-black mb-3">Roles</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(rolesData ?? []).map((r) => {
              const descriptor =
                r.role === "ADMIN"
                  ? "Full access (role-based)"
                  : r.permissions.length > 0
                  ? `${r.permissions.length} permission${r.permissions.length === 1 ? "" : "s"}`
                  : "No granular permissions";
              return (
                <div key={r.role} className="rounded-lg border border-neutral-200 bg-white px-4 py-3">
                  <p className="text-[13.5px] font-semibold text-near-black">{roleLabel(r.role)}</p>
                  <p className="text-[12.5px] text-neutral-500 mt-0.5">{descriptor}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Permission matrix — read-only reference, on the same page */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={16} className="text-brand-700" aria-hidden="true" />
            <h2 className="text-[15px] font-semibold text-near-black">Permission matrix</h2>
          </div>
          <p className="text-[12.5px] text-neutral-500 mb-3">
            Read-only — sourced from what the services enforce.{" "}
            <span className="font-medium text-neutral-600">Administrators</span> have full access regardless of these grants.
          </p>
          {rolesLoading ? (
            <p className="text-[13px] text-neutral-400">Loading…</p>
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white overflow-x-auto">
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200">
                    <th className="text-left py-2.5 px-4 font-semibold text-neutral-500 uppercase text-[11px] tracking-wide">Permission</th>
                    {columns.map((c) => (
                      <th key={c} className="py-2.5 px-3 font-semibold text-neutral-500 uppercase text-[11px] tracking-wide text-center whitespace-nowrap">
                        {roleLabel(c)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {allPermissions.map((perm, i) => {
                    const byRole = rolesData ?? [];
                    return (
                      <tr key={perm} className={i > 0 ? "border-t border-neutral-100" : ""}>
                        <td className="py-2.5 px-4 font-mono text-[12px] text-ink-700">{perm}</td>
                        {columns.map((c) => {
                          const has = byRole.find((r) => r.role === c)?.permissions.includes(perm);
                          return (
                            <td key={c} className="py-2.5 px-3 text-center">
                              {has ? (
                                <Check size={15} className="text-brand-600 inline" aria-label="granted" />
                              ) : (
                                <span className="text-neutral-200" aria-label="not granted">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Change role modal (ADMIN only) */}
      {assigning && (
        <BaseModal labelId="assign-role-title" onClose={() => setAssigning(null)}>
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md p-6">
            <h2 id="assign-role-title" className="text-[16px] font-bold text-near-black mb-1">Change role</h2>
            <p className="text-[13px] text-neutral-500 mb-4">{assigning.email}</p>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">New role</label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              disabled={changeRole.isPending}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900"
            >
              {ASSIGNABLE_ROLES.map((r) => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" onClick={() => setAssigning(null)} disabled={changeRole.isPending}>Cancel</Button>
              <Button
                variant="primary"
                onClick={() => changeRole.mutate({ userId: assigning.id, role: selectedRole })}
                disabled={changeRole.isPending || selectedRole === assigning.role}
              >
                {changeRole.isPending ? "Saving…" : "Change role"}
              </Button>
            </div>
          </div>
        </BaseModal>
      )}

      {/* Reset password confirm */}
      {resetting && (
        <BaseModal labelId="reset-title" onClose={() => setResetting(null)}>
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md p-6">
            <h2 id="reset-title" className="text-[16px] font-bold text-near-black mb-1">Reset password</h2>
            <p className="text-[13px] text-neutral-500 mb-5">
              Generate a temporary password for <span className="font-medium text-near-black">{resetting.email}</span>.
              They will be required to set a new one at next sign-in.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setResetting(null)} disabled={resetPassword.isPending}>Cancel</Button>
              <Button variant="primary" onClick={() => resetPassword.mutate(resetting.id)} disabled={resetPassword.isPending}>
                {resetPassword.isPending ? "Resetting…" : "Reset password"}
              </Button>
            </div>
          </div>
        </BaseModal>
      )}

      {/* Reset result — show the temporary password once */}
      {resetResult && (
        <BaseModal labelId="reset-result-title" onClose={() => setResetResult(null)}>
          <div className="bg-white rounded-xl shadow-xl border border-neutral-200 w-full max-w-md p-6">
            <h2 id="reset-result-title" className="text-[16px] font-bold text-near-black mb-1">Temporary password</h2>
            <p className="text-[13px] text-neutral-500 mb-4">
              Share this securely with <span className="font-medium text-near-black">{resetResult.email}</span>. It won&apos;t be shown again.
            </p>
            <div className="font-mono text-[15px] text-near-black bg-neutral-100 border border-neutral-200 rounded-lg px-4 py-3 select-all break-all">
              {resetResult.temporaryPassword}
            </div>
            <div className="flex justify-end mt-5">
              <Button variant="primary" onClick={() => setResetResult(null)}>Done</Button>
            </div>
          </div>
        </BaseModal>
      )}
    </div>
  );
}
