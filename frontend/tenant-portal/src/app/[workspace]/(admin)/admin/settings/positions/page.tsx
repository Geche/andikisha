"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { ArrowLeft, Briefcase, Plus, Pencil } from "lucide-react";
import { PageHeader, Button, BaseModal, useToast } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { useWorkspace } from "@/hooks/useWorkspace";

interface Position {
  id: string;
  title: string;
  description: string | null;
  gradeLevel: string | null;
}

type Editing = { id: string } | null;

export default function PositionsSettingsPage() {
  const workspace = useWorkspace();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Editing>(null);
  const [title, setTitle] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [description, setDescription] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery<Position[]>({
    queryKey: ["settings-positions"],
    queryFn: () => apiClient.get<Position[]>("/api/v1/positions").then((r) => r.data),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["settings-positions"] });

  function openCreate() {
    setEditing(null);
    setTitle("");
    setGradeLevel("");
    setDescription("");
    setTitleError(null);
    setModalOpen(true);
  }

  function openEdit(p: Position) {
    setEditing({ id: p.id });
    setTitle(p.title);
    setGradeLevel(p.gradeLevel ?? "");
    setDescription(p.description ?? "");
    setTitleError(null);
    setModalOpen(true);
  }

  const saveMutation = useMutation<Position, AxiosError<{ message?: string }>, void>({
    mutationFn: () => {
      const body = {
        title: title.trim(),
        gradeLevel: gradeLevel.trim() || null,
        description: description.trim() || null,
      };
      return editing
        ? apiClient.put<Position>(`/api/v1/positions/${editing.id}`, body).then((r) => r.data)
        : apiClient.post<Position>("/api/v1/positions", body).then((r) => r.data);
    },
    onSuccess: () => {
      toast(editing ? "Position updated" : "Position created", "success");
      setModalOpen(false);
      void invalidate();
    },
    onError: (err) => toast(err.response?.data?.message ?? "Could not save position.", "error"),
  });

  const seedMutation = useMutation<unknown, AxiosError, void>({
    mutationFn: () => apiClient.post("/api/v1/positions/seed-defaults"),
    onSuccess: () => {
      toast("Default positions added", "success");
      void invalidate();
    },
    onError: () => toast("Could not add defaults.", "error"),
  });

  function handleSave() {
    if (!title.trim()) {
      setTitleError("Position title is required");
      return;
    }
    saveMutation.mutate();
  }

  const positions = data ?? [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Positions"
        subtitle={isLoading ? "Loading…" : `${positions.length} position${positions.length === 1 ? "" : "s"}`}
        actions={
          <Button variant="cta" onClick={openCreate}>
            <Plus size={15} aria-hidden="true" />
            Add position
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
          <p className="text-[14px] text-danger">Could not load positions. Please retry.</p>
        ) : !isLoading && positions.length === 0 ? (
          <div className="rounded-xl border border-neutral-200 bg-white p-8 text-center">
            <Briefcase className="w-8 h-8 text-neutral-300 mx-auto mb-3" aria-hidden="true" />
            <p className="text-[14px] font-semibold text-near-black mb-1">No positions yet</p>
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
            {positions.map((p, i) => (
              <div
                key={p.id}
                className={`flex items-center justify-between gap-4 px-5 py-3.5 ${i > 0 ? "border-t border-neutral-100" : ""}`}
              >
                <div className="min-w-0">
                  <p className="text-[14px] font-medium text-near-black truncate">{p.title}</p>
                  {p.description && <p className="text-[12.5px] text-neutral-500 truncate">{p.description}</p>}
                </div>
                <div className="flex items-center gap-4 flex-shrink-0">
                  {p.gradeLevel && (
                    <span className="text-[12px] font-mono text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded">
                      {p.gradeLevel}
                    </span>
                  )}
                  <button
                    onClick={() => openEdit(p)}
                    className="text-neutral-400 hover:text-brand-700 transition-colors"
                    aria-label={`Edit ${p.title}`}
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
        <BaseModal labelId="pos-modal-title" onClose={() => setModalOpen(false)} maxWidth="max-w-md">
          <div>
            <h2 id="pos-modal-title" className="text-[16px] font-bold text-near-black mb-4">
              {editing ? "Edit position" : "Add position"}
            </h2>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setTitleError(null); }}
              disabled={saveMutation.isPending}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 mb-1"
              placeholder="e.g. Software Engineer"
            />
            {titleError && <p className="text-[12px] text-danger mb-2">{titleError}</p>}
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5 mt-3">Grade level</label>
            <input
              type="text"
              value={gradeLevel}
              onChange={(e) => setGradeLevel(e.target.value)}
              disabled={saveMutation.isPending}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900"
              placeholder="Optional, e.g. L4"
            />
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
