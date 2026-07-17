"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { ArrowLeft, Building2, Plus, Pencil } from "lucide-react";
import { PageHeader, Button, BaseModal, useToast } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { useWorkspace } from "@/hooks/useWorkspace";

interface Department {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  employeeCount: number;
}

type Editing = { id: string; name: string; description: string } | null;

export default function DepartmentsSettingsPage() {
  const workspace = useWorkspace();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Editing>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<Department[]>({
    queryKey: ["settings-departments"],
    queryFn: () => apiClient.get<Department[]>("/api/v1/departments").then((r) => r.data),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["settings-departments"] });

  function openCreate() {
    setEditing(null);
    setName("");
    setDescription("");
    setNameError(null);
    setModalOpen(true);
  }

  function openEdit(d: Department) {
    setEditing({ id: d.id, name: d.name, description: d.description ?? "" });
    setName(d.name);
    setDescription(d.description ?? "");
    setNameError(null);
    setModalOpen(true);
  }

  const saveMutation = useMutation<Department, AxiosError<{ message?: string }>, void>({
    mutationFn: () => {
      const body = { name: name.trim(), description: description.trim() || null };
      return editing
        ? apiClient.put<Department>(`/api/v1/departments/${editing.id}`, body).then((r) => r.data)
        : apiClient.post<Department>("/api/v1/departments", body).then((r) => r.data);
    },
    onSuccess: () => {
      toast(editing ? "Department updated" : "Department created", "success");
      setModalOpen(false);
      void invalidate();
    },
    onError: (err) => toast(err.response?.data?.message ?? "Could not save department.", "error"),
  });

  const seedMutation = useMutation<unknown, AxiosError, void>({
    mutationFn: () => apiClient.post("/api/v1/departments/seed-defaults"),
    onSuccess: () => {
      toast("Default departments added", "success");
      void invalidate();
    },
    onError: () => toast("Could not add defaults.", "error"),
  });

  function handleSave() {
    if (!name.trim()) {
      setNameError("Department name is required");
      return;
    }
    saveMutation.mutate();
  }

  const departments = data ?? [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Departments"
        subtitle={isLoading ? "Loading…" : `${departments.length} department${departments.length === 1 ? "" : "s"}`}
        actions={
          <Button variant="cta" onClick={openCreate}>
            <Plus size={15} aria-hidden="true" />
            Add department
          </Button>
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6 space-y-4">
        <Link
          href={`/${workspace}/admin/settings`}
          className="inline-flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-near-black transition-colors"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Settings
        </Link>

        {isError ? (
          <p className="text-[14px] text-danger">Could not load departments. Please retry.</p>
        ) : !isLoading && departments.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
            <Building2 className="w-8 h-8 text-neutral-300 mx-auto mb-3" aria-hidden="true" />
            <p className="text-[14px] font-semibold text-near-black mb-1">No departments yet</p>
            <p className="text-[13px] text-neutral-500 mb-4">Start with our suggested set, or add your own.</p>
            <div className="flex items-center justify-center gap-2">
              <Button variant="primary" onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
                {seedMutation.isPending ? "Adding…" : "Use suggested defaults"}
              </Button>
              <Button variant="outline" onClick={openCreate}>Add custom</Button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
            {departments.map((d, i) => (
              <div
                key={d.id}
                className={`flex items-center justify-between gap-4 px-5 py-3.5 ${i > 0 ? "border-t border-neutral-100" : ""}`}
              >
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-near-black truncate">{d.name}</p>
                  {d.description && <p className="text-[12.5px] text-neutral-500 truncate">{d.description}</p>}
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  <span className="text-[12.5px] text-neutral-400 tabular-nums">
                    {d.employeeCount} {d.employeeCount === 1 ? "employee" : "employees"}
                  </span>
                  <button
                    onClick={() => openEdit(d)}
                    className="text-neutral-400 hover:text-brand-700 transition-colors"
                    aria-label={`Edit ${d.name}`}
                  >
                    <Pencil size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {modalOpen && (
        <BaseModal labelId="dept-modal-title" onClose={() => setModalOpen(false)} maxWidth="max-w-md">
          <div>
            <h2 id="dept-modal-title" className="text-[16px] font-bold text-near-black mb-4">
              {editing ? "Edit department" : "Add department"}
            </h2>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setNameError(null); }}
              disabled={saveMutation.isPending}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 mb-1"
              placeholder="e.g. Finance"
            />
            {nameError && <p className="text-[12px] text-danger mb-2">{nameError}</p>}
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5 mt-3">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saveMutation.isPending}
              rows={2}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 resize-none"
              placeholder="Optional"
            />
            <div className="flex justify-end gap-2 mt-5">
              <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saveMutation.isPending}>Cancel</Button>
              <Button variant="primary" onClick={handleSave} disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving…" : editing ? "Save changes" : "Create"}
              </Button>
            </div>
          </div>
        </BaseModal>
      )}
    </div>
  );
}
