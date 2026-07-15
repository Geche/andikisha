"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { ChevronUp, ChevronDown, Trash2, Plus, ScrollText } from "lucide-react";
import {
  SheetRoot, SheetContent, Button, Badge, Spinner, EmptyState, useToast,
} from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { listErrorMessage } from "@/lib/queryError";
import {
  ASSIGNEE_ROLE_LABELS,
  ASSIGNEE_ROLE_OPTIONS,
  COMPLETION_TYPE_LABELS,
  type LifecycleType,
  type LifecycleTemplate,
  type LifecycleTaskDefinitionInput,
  type LifecycleAssigneeRole,
  type LifecycleCompletionType,
} from "@/types/lifecycle";

interface TemplatesSheetProps {
  type: LifecycleType;
  onClose: () => void;
}

const inputCls =
  "w-full border border-neutral-200 rounded-lg px-3 py-2 text-[13px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900";

function blankTask(): LifecycleTaskDefinitionInput {
  return { title: "", description: null, assigneeRole: "HR_OFFICER", completionType: "MANUAL", dueOffsetDays: null };
}

export function TemplatesSheet({ type, onClose }: TemplatesSheetProps) {
  const { data, isLoading, isError, error } = useQuery<LifecycleTemplate[]>({
    queryKey: ["lifecycle-templates"],
    queryFn: () =>
      apiClient.get<LifecycleTemplate[]>("/api/v1/employees/lifecycle/templates").then((r) => r.data),
  });

  const [creating, setCreating] = useState(false);

  const templates = (data ?? []).filter((t) => t.type === type && t.active);
  const noun = type === "ONBOARDING" ? "onboarding templates" : "offboarding templates";

  return (
    <SheetRoot open onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        title="Manage templates"
        description={type === "ONBOARDING" ? "Onboarding checklists" : "Offboarding checklists"}
        width="w-full max-w-xl"
      >
        <div className="flex justify-end mb-4">
          <Button variant="secondary" size="sm" onClick={() => setCreating((c) => !c)}>
            <Plus size={14} aria-hidden="true" />
            New template
          </Button>
        </div>

        {creating && (
          <div className="mb-5">
            <TemplateEditor type={type} onDone={() => setCreating(false)} />
          </div>
        )}

        {isError ? (
          <div className="text-[13px] text-red-700">{listErrorMessage(error, noun)}</div>
        ) : isLoading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : templates.length === 0 && !creating ? (
          <EmptyState
            icon={ScrollText}
            title="No templates yet"
            description={`Create a ${type === "ONBOARDING" ? "onboarding" : "offboarding"} template to define the checklist new instances start from.`}
          />
        ) : (
          <div className="flex flex-col gap-4">
            {templates.map((tpl) => (
              <TemplateCard key={tpl.id} template={tpl} />
            ))}
          </div>
        )}
      </SheetContent>
    </SheetRoot>
  );
}

// ─── Template card (view + edit + deactivate) ────────────────────────────────

function TemplateCard({ template }: { template: LifecycleTemplate }) {
  const [editing, setEditing] = useState(false);
  const queryClient = useQueryClient();
  const toast = useToast();

  const deactivate = useMutation<void, AxiosError<{ message?: string }>, void>({
    mutationFn: () =>
      apiClient.patch(`/api/v1/employees/lifecycle/templates/${template.id}/deactivate`).then(() => undefined),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["lifecycle-templates"] });
      toast("Template deactivated", "success");
    },
    onError: (err) => toast(err.response?.data?.message ?? "Could not deactivate this template.", "error"),
  });

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[14px] font-semibold text-near-black">{template.name}</p>
          <p className="text-[12px] text-neutral-500 mt-0.5">
            {template.tasks.length} task{template.tasks.length === 1 ? "" : "s"}
          </p>
        </div>
        <Badge status="active">Active</Badge>
      </div>

      {!editing && (
        <div className="flex items-center gap-2 mt-3">
          <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>Edit tasks</Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={deactivate.isPending}
            onClick={() => deactivate.mutate()}
          >
            {deactivate.isPending ? "Deactivating…" : "Deactivate"}
          </Button>
        </div>
      )}

      {editing && (
        <div className="mt-4">
          <TemplateEditor type={template.type} template={template} onDone={() => setEditing(false)} />
        </div>
      )}
    </div>
  );
}

// ─── Template editor (create or replace tasks) ───────────────────────────────

function TemplateEditor({
  type,
  template,
  onDone,
}: {
  type: LifecycleType;
  template?: LifecycleTemplate;
  onDone: () => void;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [name, setName] = useState(template?.name ?? "");
  const [tasks, setTasks] = useState<LifecycleTaskDefinitionInput[]>(
    template
      ? template.tasks.map((t) => ({
          title: t.title,
          description: t.description,
          assigneeRole: t.assigneeRole,
          completionType: t.completionType,
          dueOffsetDays: t.dueOffsetDays,
        }))
      : [blankTask()],
  );

  const applicableEmploymentTypes = template?.applicableEmploymentTypes ?? [];

  const save = useMutation<LifecycleTemplate, AxiosError<{ message?: string }>, void>({
    mutationFn: () => {
      const body = { type, name: name.trim(), applicableEmploymentTypes, tasks };
      const req = template
        ? apiClient.put<LifecycleTemplate>(`/api/v1/employees/lifecycle/templates/${template.id}`, body)
        : apiClient.post<LifecycleTemplate>("/api/v1/employees/lifecycle/templates", body);
      return req.then((r) => r.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["lifecycle-templates"] });
      toast(template ? "Template updated" : "Template created", "success");
      onDone();
    },
    onError: (err) => toast(err.response?.data?.message ?? "Could not save the template. Please try again.", "error"),
  });

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= tasks.length) return;
    setTasks((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target]!, next[index]!];
      return next;
    });
  }

  function update(index: number, patch: Partial<LifecycleTaskDefinitionInput>) {
    setTasks((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  const canSave = name.trim().length > 0 && tasks.length > 0 && tasks.every((t) => t.title.trim().length > 0);

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
      <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Template name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={type === "ONBOARDING" ? "e.g. Permanent staff onboarding" : "e.g. Standard offboarding"}
        className={inputCls}
      />

      <p className="text-[11px] font-bold uppercase tracking-widest text-brand-700 mt-4 mb-2">Tasks</p>
      <div className="flex flex-col gap-3">
        {tasks.map((task, i) => (
          <div key={i} className="rounded-lg border border-neutral-200 bg-white p-3">
            <div className="flex items-start gap-2">
              <div className="flex flex-col gap-1 pt-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label="Move task up"
                  className="text-neutral-400 hover:text-neutral-700 disabled:opacity-30 disabled:hover:text-neutral-400"
                >
                  <ChevronUp size={15} />
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === tasks.length - 1}
                  aria-label="Move task down"
                  className="text-neutral-400 hover:text-neutral-700 disabled:opacity-30 disabled:hover:text-neutral-400"
                >
                  <ChevronDown size={15} />
                </button>
              </div>

              <div className="flex-1 min-w-0 flex flex-col gap-2">
                <input
                  type="text"
                  value={task.title}
                  onChange={(e) => update(i, { title: e.target.value })}
                  placeholder="Task title"
                  className={inputCls}
                />
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={task.assigneeRole}
                    onChange={(e) => update(i, { assigneeRole: e.target.value as LifecycleAssigneeRole })}
                    className={inputCls}
                    aria-label="Assignee role"
                  >
                    {ASSIGNEE_ROLE_OPTIONS.map((r) => (
                      <option key={r} value={r}>{ASSIGNEE_ROLE_LABELS[r]}</option>
                    ))}
                  </select>
                  <select
                    value={task.completionType}
                    onChange={(e) => update(i, { completionType: e.target.value as LifecycleCompletionType })}
                    className={inputCls}
                    aria-label="Completion type"
                  >
                    {(["MANUAL", "DOCUMENT_UPLOAD"] as LifecycleCompletionType[]).map((c) => (
                      <option key={c} value={c}>{COMPLETION_TYPE_LABELS[c]}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    value={task.dueOffsetDays ?? ""}
                    onChange={(e) =>
                      update(i, { dueOffsetDays: e.target.value === "" ? null : Number(e.target.value) })
                    }
                    placeholder="Due (days)"
                    className={inputCls}
                    aria-label="Due offset in days"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTasks((prev) => prev.filter((_, idx) => idx !== i))}
                disabled={tasks.length === 1}
                aria-label="Remove task"
                className="text-neutral-400 hover:text-red-600 disabled:opacity-30 pt-1"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setTasks((prev) => [...prev, blankTask()])}
        className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-brand-700 hover:text-brand-900"
      >
        <Plus size={14} aria-hidden="true" />
        Add task
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
