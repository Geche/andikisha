"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { ChevronUp, ChevronDown, Trash2, Plus, GitBranch, Lock } from "lucide-react";
import {
  PageHeader, Button, Badge, Skeleton, EmptyState, PermissionGate, useToast,
} from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { ListErrorState } from "@/components/ListErrorState";
import { usePipelineTemplates, recruitmentKeys } from "@/hooks/useRecruitment";
import {
  isAnchorCategory,
  CUSTOM_STAGE_CATEGORY_OPTIONS,
  STAGE_CATEGORY_LABELS,
  type PipelineTemplate,
  type StageCategory,
  type StageInput,
} from "@/types/recruitment";

const BASE = "/api/v1/recruitment/pipeline-templates";

const inputCls =
  "w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900";

/** An editable stage row: id is null for a not-yet-persisted stage. */
interface StageRow {
  id: string | null;
  name: string;
  category: StageCategory;
}

function defaultStages(): StageRow[] {
  return [
    { id: null, name: "Applied", category: "APPLIED" },
    { id: null, name: "Screening", category: "INTERMEDIATE" },
    { id: null, name: "Interview", category: "INTERMEDIATE" },
    { id: null, name: "Offer", category: "OFFER" },
    { id: null, name: "Hired", category: "HIRED" },
    { id: null, name: "Rejected", category: "REJECTED" },
  ];
}

export function PipelineTemplatesManager() {
  const { data, isLoading, isError, error, refetch } = usePipelineTemplates();
  const [creating, setCreating] = useState(false);

  const templates = (data ?? []).filter((t) => t.active);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Pipeline templates"
        subtitle={isLoading ? "Loading…" : `${templates.length} active template${templates.length === 1 ? "" : "s"}`}
        actions={
          <PermissionGate anyOf={["ADMIN", "HR_MANAGER"]}>
            <Button variant="cta" onClick={() => setCreating((c) => !c)}>
              <Plus size={15} aria-hidden="true" />
              New template
            </Button>
          </PermissionGate>
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6 space-y-4">
        {creating && (
          <TemplateEditor onDone={() => setCreating(false)} />
        )}

        {isError ? (
          <ListErrorState error={error} noun="pipeline templates" onRetry={() => void refetch()} />
        ) : isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : templates.length === 0 && !creating ? (
          <EmptyState
            icon={GitBranch}
            title="No pipeline templates"
            description="Create a template to define the ordered stages candidates move through."
          />
        ) : (
          <div className="space-y-4">
            {templates.map((tpl) => (
              <TemplateCard key={tpl.id} template={tpl} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Template card (view + edit + deactivate) ────────────────────────────────

function TemplateCard({ template }: { template: PipelineTemplate }) {
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();

  const deactivate = useMutation<void, AxiosError<{ message?: string }>, void>({
    mutationFn: () => apiClient.patch(`${BASE}/${template.id}/deactivate`).then(() => undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recruitmentKeys.templates });
      toast("Template deactivated", "success");
    },
    onError: (err) => toast(err.response?.data?.message ?? "Could not deactivate this template.", "error"),
  });

  const sorted = [...template.stages].sort((a, b) => a.orderIndex - b.orderIndex);

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[14px] font-semibold text-near-black">{template.name}</p>
          <p className="text-[12px] text-neutral-500 mt-0.5">
            {template.stages.length} stage{template.stages.length === 1 ? "" : "s"}
          </p>
        </div>
        <Badge status="active">Active</Badge>
      </div>

      {!editing && (
        <>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {sorted.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1 rounded-md bg-neutral-50 border border-neutral-200 px-2 py-1 text-[11.5px] text-neutral-600"
              >
                {s.isProtected && <Lock size={11} aria-hidden="true" className="text-neutral-400" />}
                {s.name}
              </span>
            ))}
          </div>

          <PermissionGate anyOf={["ADMIN", "HR_MANAGER"]}>
            <div className="flex items-center gap-2 mt-4">
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Edit stages</Button>
              <Button variant="ghost" size="sm" disabled={deactivate.isPending} onClick={() => deactivate.mutate()}>
                {deactivate.isPending ? "Deactivating…" : "Deactivate"}
              </Button>
            </div>
          </PermissionGate>
        </>
      )}

      {editing && (
        <div className="mt-4">
          <TemplateEditor template={template} onDone={() => setEditing(false)} />
        </div>
      )}
    </div>
  );
}

// ─── Template editor (create or edit stages, anchors protected) ──────────────

function TemplateEditor({
  template,
  onDone,
}: {
  template?: PipelineTemplate;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [name, setName] = useState(template?.name ?? "");
  const [stages, setStages] = useState<StageRow[]>(
    template
      ? [...template.stages]
          .sort((a, b) => a.orderIndex - b.orderIndex)
          .map((s) => ({ id: s.id, name: s.name, category: s.category }))
      : defaultStages(),
  );

  const save = useMutation<PipelineTemplate, AxiosError<{ message?: string }>, void>({
    mutationFn: () => {
      const body = {
        name: name.trim(),
        stages: stages.map<StageInput>((s) => ({ id: s.id, name: s.name.trim(), category: s.category })),
      };
      const req = template
        ? apiClient.put<PipelineTemplate>(`${BASE}/${template.id}`, body)
        : apiClient.post<PipelineTemplate>(BASE, body);
      return req.then((r) => r.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recruitmentKeys.templates });
      toast(template ? "Template updated" : "Template created", "success");
      onDone();
    },
    // Surface the server rejection verbatim (ANCHOR_STAGE_PROTECTED / ANCHOR_CATEGORY_PROTECTED, etc.).
    onError: (err) => toast(err.response?.data?.message ?? "Could not save the template.", "error"),
  });

  // Only non-anchor rows are movable, and only past other non-anchor rows. This keeps
  // APPLIED first and HIRED/REJECTED terminal without a special-case per anchor.
  function canMoveUp(i: number): boolean {
    return !isAnchorCategory(stages[i]!.category) && i > 0 && !isAnchorCategory(stages[i - 1]!.category);
  }
  function canMoveDown(i: number): boolean {
    return (
      !isAnchorCategory(stages[i]!.category) &&
      i < stages.length - 1 &&
      !isAnchorCategory(stages[i + 1]!.category)
    );
  }

  function move(i: number, dir: -1 | 1) {
    const target = i + dir;
    setStages((prev) => {
      const next = [...prev];
      [next[i], next[target]] = [next[target]!, next[i]!];
      return next;
    });
  }

  function update(i: number, patch: Partial<StageRow>) {
    setStages((prev) => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }

  function remove(i: number) {
    setStages((prev) => prev.filter((_, idx) => idx !== i));
  }

  // A custom stage lands between APPLIED and the terminal anchors (before the first
  // HIRED/REJECTED), defaulting to INTERMEDIATE.
  function addStage() {
    setStages((prev) => {
      const terminalIdx = prev.findIndex((s) => s.category === "HIRED" || s.category === "REJECTED");
      const insertAt = terminalIdx === -1 ? prev.length : terminalIdx;
      const next = [...prev];
      next.splice(insertAt, 0, { id: null, name: "New stage", category: "INTERMEDIATE" });
      return next;
    });
  }

  const canSave =
    name.trim().length > 0 && stages.length > 0 && stages.every((s) => s.name.trim().length > 0);

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Template name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Standard hiring pipeline"
        className={inputCls}
      />

      <p className="text-[11px] font-bold uppercase tracking-widest text-brand-700 mt-4 mb-2">Stages</p>
      <div className="flex flex-col gap-3">
        {stages.map((stage, i) => {
          const anchor = isAnchorCategory(stage.category);
          return (
            <div key={stage.id ?? `new-${i}`} className="rounded-lg border border-neutral-200 bg-white p-3">
              <div className="flex items-start gap-2">
                <div className="flex flex-col gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => move(i, -1)}
                    disabled={!canMoveUp(i)}
                    aria-label="Move stage up"
                    className="text-neutral-400 hover:text-neutral-700 disabled:opacity-30 disabled:hover:text-neutral-400"
                  >
                    <ChevronUp size={15} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(i, 1)}
                    disabled={!canMoveDown(i)}
                    aria-label="Move stage down"
                    className="text-neutral-400 hover:text-neutral-700 disabled:opacity-30 disabled:hover:text-neutral-400"
                  >
                    <ChevronDown size={15} />
                  </button>
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-2">
                  <input
                    type="text"
                    value={stage.name}
                    onChange={(e) => update(i, { name: e.target.value })}
                    placeholder="Stage name"
                    className={inputCls}
                    aria-label="Stage name"
                  />
                  <div className="flex items-center gap-2">
                    <select
                      value={stage.category}
                      onChange={(e) => update(i, { category: e.target.value as StageCategory })}
                      disabled={anchor}
                      className={`${inputCls} disabled:opacity-60 disabled:cursor-not-allowed`}
                      aria-label="Stage category"
                    >
                      {anchor ? (
                        <option value={stage.category}>{STAGE_CATEGORY_LABELS[stage.category]}</option>
                      ) : (
                        CUSTOM_STAGE_CATEGORY_OPTIONS.map((c) => (
                          <option key={c} value={c}>{STAGE_CATEGORY_LABELS[c]}</option>
                        ))
                      )}
                    </select>
                    {anchor && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-400 flex-shrink-0">
                        <Lock size={12} aria-hidden="true" />
                        Protected
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => remove(i)}
                  disabled={anchor}
                  aria-label={anchor ? "Protected stage cannot be removed" : "Remove stage"}
                  className="text-neutral-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-neutral-400 pt-1"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={addStage}
        className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-700 hover:text-brand-900"
      >
        <Plus size={14} aria-hidden="true" />
        Add stage
      </button>

      <div className="flex items-center gap-2 mt-4">
        <Button variant="primary" size="sm" disabled={!canSave || save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? "Saving…" : template ? "Save changes" : "Create template"}
        </Button>
        <Button variant="ghost" size="sm" disabled={save.isPending} onClick={onDone}>Cancel</Button>
      </div>
    </div>
  );
}
