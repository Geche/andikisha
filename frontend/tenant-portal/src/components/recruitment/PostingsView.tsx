"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Plus, Send } from "lucide-react";
import {
  PageHeader, Button, Badge, BaseModal, DataTable, EmptyState, PermissionGate, useToast, formatDate,
} from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { ListErrorState } from "@/components/ListErrorState";
import { useWorkspace } from "@/hooks/useWorkspace";
import { usePostings, useRequisitions, usePipelineTemplates, recruitmentKeys } from "@/hooks/useRecruitment";
import {
  postingBadgeStatus,
  type CreatePostingInput,
  type Posting,
} from "@/types/recruitment";

const BASE = "/api/v1/recruitment/postings";

export function PostingsView() {
  const router = useRouter();
  const workspace = useWorkspace();
  const { data, isLoading, isError, error, refetch } = usePostings();
  const requisitionsQuery = useRequisitions();
  const templatesQuery = usePipelineTemplates();
  const [createOpen, setCreateOpen] = useState(false);

  const postings = data ?? [];
  const reqTitle = new Map((requisitionsQuery.data ?? []).map((r) => [r.id, r.title]));

  const columns = [
    { key: "title", label: "Title" },
    { key: "requisition", label: "Requisition" },
    { key: "location", label: "Location" },
    { key: "closing", label: "Closing date" },
    { key: "status", label: "Status" },
    { key: "action", label: "", align: "right" as const },
  ];

  const rows = postings.map((p) => ({
    _id: p.id,
    title: <span className="font-medium text-near-black">{p.title}</span>,
    requisition: reqTitle.get(p.requisitionId) ?? "—",
    location: p.location ?? "—",
    closing: p.closingDate ? formatDate(p.closingDate) : "—",
    status: <Badge status={postingBadgeStatus(p.status)}>{p.status}</Badge>,
    action:
      p.status === "DRAFT" ? (
        <PermissionGate anyOf={["ADMIN", "HR_MANAGER"]}>
          <PublishButton postingId={p.id} />
        </PermissionGate>
      ) : null,
  }));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Job postings"
        subtitle={isLoading ? "Loading…" : `${postings.length} posting${postings.length === 1 ? "" : "s"}`}
        actions={
          <PermissionGate anyOf={["ADMIN", "HR_MANAGER"]}>
            <Button variant="cta" onClick={() => setCreateOpen(true)}>
              <Plus size={15} aria-hidden="true" />
              New posting
            </Button>
          </PermissionGate>
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
        {isError ? (
          <ListErrorState error={error} noun="job postings" onRetry={() => void refetch()} />
        ) : !isLoading && postings.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="No job postings yet"
            description="Create a posting from an open requisition, then open it to manage the candidate pipeline."
          />
        ) : (
          <DataTable
            columns={columns}
            rows={rows}
            isLoading={isLoading}
            emptyMessage="No job postings"
            onRowClick={(row) => {
              const id = row._id as string;
              router.push(`/${workspace}/admin/recruitment/postings/${id}`);
            }}
          />
        )}
      </div>

      {createOpen && (
        <PostingFormModal
          requisitions={requisitionsQuery.data ?? []}
          templates={(templatesQuery.data ?? []).filter((t) => t.active)}
          onClose={() => setCreateOpen(false)}
        />
      )}
    </div>
  );
}

function PublishButton({ postingId }: { postingId: string }) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const publish = useMutation<Posting, AxiosError<{ message?: string }>, void>({
    mutationFn: () => apiClient.post<Posting>(`${BASE}/${postingId}/publish`).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recruitmentKeys.postings });
      toast("Posting published", "success");
    },
    onError: (err) => toast(err.response?.data?.message ?? "Could not publish this posting.", "error"),
  });

  return (
    <Button
      variant="secondary"
      size="sm"
      disabled={publish.isPending}
      onClick={(e) => {
        e.stopPropagation();
        publish.mutate();
      }}
    >
      <Send size={14} aria-hidden="true" />
      {publish.isPending ? "Publishing…" : "Publish"}
    </Button>
  );
}

// ─── Create modal ────────────────────────────────────────────────────────────

const inputCls =
  "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900";

function PostingFormModal({
  requisitions,
  templates,
  onClose,
}: {
  requisitions: { id: string; title: string }[];
  templates: { id: string; name: string }[];
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [requisitionId, setRequisitionId] = useState("");
  const [pipelineTemplateId, setPipelineTemplateId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [closingDate, setClosingDate] = useState("");

  const create = useMutation<Posting, AxiosError<{ message?: string }>, void>({
    mutationFn: () => {
      const body: CreatePostingInput = {
        requisitionId,
        pipelineTemplateId,
        title: title.trim(),
        description: description.trim() || null,
        location: location.trim() || null,
        closingDate: closingDate || null,
      };
      return apiClient.post<Posting>(BASE, body).then((r) => r.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recruitmentKeys.postings });
      toast("Posting created", "success");
      onClose();
    },
    onError: (err) => toast(err.response?.data?.message ?? "Could not create posting.", "error"),
  });

  const canSave = requisitionId !== "" && pipelineTemplateId !== "" && title.trim().length > 0;

  return (
    <BaseModal labelId="posting-title" onClose={onClose} maxWidth="max-w-lg">
      <h2 id="posting-title" className="text-[16px] font-bold text-near-black mb-4">New job posting</h2>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Requisition</label>
            <select value={requisitionId} onChange={(e) => setRequisitionId(e.target.value)} className={inputCls} disabled={create.isPending}>
              <option value="">Select requisition</option>
              {requisitions.map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Pipeline template</label>
            <select value={pipelineTemplateId} onChange={(e) => setPipelineTemplateId(e.target.value)} className={inputCls} disabled={create.isPending}>
              <option value="">Select template</option>
              {templates.map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} disabled={create.isPending} placeholder="e.g. Senior accountant — Nairobi" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} disabled={create.isPending} placeholder="Optional" />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Closing date</label>
            <input type="date" value={closingDate} onChange={(e) => setClosingDate(e.target.value)} className={inputCls} disabled={create.isPending} />
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${inputCls} resize-none`} disabled={create.isPending} placeholder="Optional" />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-5">
        <Button variant="outline" onClick={onClose} disabled={create.isPending}>Cancel</Button>
        <Button variant="primary" onClick={() => create.mutate()} disabled={!canSave || create.isPending}>
          {create.isPending ? "Creating…" : "Create posting"}
        </Button>
      </div>
    </BaseModal>
  );
}
