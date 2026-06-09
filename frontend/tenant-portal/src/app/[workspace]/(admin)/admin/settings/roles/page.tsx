"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { PageHeader, Button, BaseModal, useToast, useCurrentUser } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { useWorkspace } from "@/hooks/useWorkspace";

interface RolePermissions {
  role: string;
  permissions: string[];
}
interface TenantUser {
  id: string;
  email: string;
  role: string;
  employeeId: string | null;
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

export default function RolesSettingsPage() {
  const workspace = useWorkspace();
  const queryClient = useQueryClient();
  const toast = useToast();
  const currentUser = useCurrentUser();
  const isAdmin = currentUser?.roles.includes("ADMIN") ?? false;

  const [assigning, setAssigning] = useState<TenantUser | null>(null);
  const [selectedRole, setSelectedRole] = useState("");

  const { data: rolesData, isLoading: rolesLoading } = useQuery<RolePermissions[]>({
    queryKey: ["settings-roles"],
    queryFn: () => apiClient.get<RolePermissions[]>("/api/v1/auth/roles").then((r) => r.data),
    enabled: isAdmin,
  });
  const { data: usersData, isLoading: usersLoading } = useQuery<TenantUser[]>({
    queryKey: ["settings-users"],
    queryFn: () => apiClient.get<TenantUser[]>("/api/v1/auth/users").then((r) => r.data),
    enabled: isAdmin,
  });

  // Matrix: permission rows × roles-with-grants columns. ADMIN (full access) and
  // any role with no granular grants are summarised separately, not as empty columns.
  const { columns, allPermissions } = useMemo(() => {
    const roles = rolesData ?? [];
    const cols = roles.filter((r) => r.permissions.length > 0).map((r) => r.role);
    const perms = Array.from(new Set(roles.flatMap((r) => r.permissions))).sort();
    return { columns: cols, allPermissions: perms };
  }, [rolesData]);

  const changeRole = useMutation<unknown, AxiosError<{ message?: string }>, { userId: string; role: string }>({
    mutationFn: ({ userId, role }) =>
      apiClient.patch(`/api/v1/auth/users/${userId}/role`, { role }),
    onSuccess: () => {
      toast("Role updated", "success");
      setAssigning(null);
      void queryClient.invalidateQueries({ queryKey: ["settings-users"] });
    },
    onError: (err) => toast(err.response?.data?.message ?? "Could not change role.", "error"),
  });

  if (!isAdmin) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <PageHeader title="Roles & permissions" />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[14px] text-neutral-500">
            You need administrator access to manage roles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader title="Roles & permissions" subtitle="What each role can do, and who holds it." />

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6 space-y-8">
        <Link
          href={`/${workspace}/admin/settings`}
          className="inline-flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-near-black transition-colors"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Settings
        </Link>

        {/* Permission matrix */}
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

        {/* Users + assignment */}
        <section>
          <h2 className="text-[15px] font-semibold text-near-black mb-3">People &amp; roles</h2>
          {usersLoading ? (
            <p className="text-[13px] text-neutral-400">Loading…</p>
          ) : (
            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
              {(usersData ?? []).map((u, i) => (
                <div key={u.id} className={`flex items-center justify-between gap-4 px-5 py-3 ${i > 0 ? "border-t border-neutral-100" : ""}`}>
                  <div className="min-w-0">
                    <p className="text-[13.5px] text-near-black truncate">{u.email}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[12.5px] font-medium text-ink-700 bg-neutral-100 px-2.5 py-0.5 rounded-full">
                      {roleLabel(u.role)}
                    </span>
                    {u.role !== "ADMIN" && u.role !== "SUPER_ADMIN" && (
                      <button
                        onClick={() => { setAssigning(u); setSelectedRole(u.role); }}
                        className="text-[13px] font-semibold text-brand-700 hover:underline"
                      >
                        Change
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {assigning && (
        <BaseModal labelId="assign-role-title" onClose={() => setAssigning(null)}>
          <div className="p-6 w-full max-w-md">
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
    </div>
  );
}
