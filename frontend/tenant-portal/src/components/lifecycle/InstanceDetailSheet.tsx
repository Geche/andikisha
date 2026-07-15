"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import type { AxiosError } from "axios";
import { Check, SkipForward, FileText, CircleCheck, MinusCircle, ScrollText } from "lucide-react";
import { SheetRoot, SheetContent, Badge, Button, PermissionGate, Spinner, useToast } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import {
  ASSIGNEE_ROLE_LABELS,
  COMPLETION_TYPE_LABELS,
  type LifecycleInstance,
  type LifecycleTask,
} from "@/types/lifecycle";
import {
  instanceBadgeStatus,
  instanceStatusLabel,
  taskBadgeStatus,
  taskStatusLabel,
  formatDueDate,
  daysInStageLabel,
} from "./helpers";

interface InstanceDetailSheetProps {
  instanceId: string;
  /** Instance from the board list, used to seed the single-instance query. */
  fallback: LifecycleInstance;
  employeeName: string;
  workspace: string;
  onClose: () => void;
}

export function InstanceDetailSheet({
  instanceId,
  fallback,
  employeeName,
  workspace,
  onClose,
}: InstanceDetailSheetProps) {
  const { data: instance, isFetching } = useQuery<LifecycleInstance>({
    queryKey: ["lifecycle-instance", instanceId],
    queryFn: () =>
      apiClient
        .get<LifecycleInstance>(`/api/v1/employees/lifecycle/instances/${instanceId}`)
        .then((r) => r.data),
    initialData: fallback,
  });

  const inst = instance ?? fallback;
  const isOffboardingComplete = inst.type === "OFFBOARDING" && inst.status === "COMPLETED";

  return (
    <SheetRoot open onOpenChange={(o) => { if (!o) onClose(); }}>
      <SheetContent
        title={employeeName}
        description={`${inst.type === "ONBOARDING" ? "Onboarding" : "Offboarding"} · ${daysInStageLabel(inst.startedAt)}`}
        width="w-full max-w-lg"
      >
        {/* Summary row */}
        <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-neutral-100">
          <Badge status={instanceBadgeStatus(inst.status)}>{instanceStatusLabel(inst.status)}</Badge>
          <span className="text-[12.5px] text-neutral-500 font-mono">
            {inst.completedTaskCount}/{inst.totalTaskCount} tasks
          </span>
          {isFetching && <Spinner />}
        </div>

        {/* System note (e.g. why blocked) */}
        {inst.systemNote && (
          <div className="mb-4 rounded-lg bg-amber-light border border-amber px-4 py-3 text-[12.5px] text-amber-text">
            {inst.systemNote}
          </div>
        )}

        {/* D3 — Certificate of Service hint for completed offboarding */}
        {isOffboardingComplete && (
          <div className="mb-4 flex items-start gap-2.5 rounded-lg bg-brand-50 border border-brand-100 px-4 py-3">
            <ScrollText size={16} className="text-brand-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div className="text-[12.5px] text-brand-900 leading-relaxed">
              A Certificate of Service draft has been created for this employee.
              Review and issue it from{" "}
              <Link
                href={`/${workspace}/admin/certificates`}
                className="font-semibold underline underline-offset-2 hover:opacity-80"
              >
                Certificates
              </Link>
              .
            </div>
          </div>
        )}

        {/* Checklist */}
        <p className="text-[11px] font-bold uppercase tracking-widest text-brand-700 mb-3">Checklist</p>
        <div className="flex flex-col gap-2.5">
          {inst.tasks.length === 0 ? (
            <p className="text-[13px] text-neutral-400">This workflow has no tasks.</p>
          ) : (
            inst.tasks.map((task) => (
              <TaskRow key={task.id} task={task} instanceId={inst.id} />
            ))
          )}
        </div>
      </SheetContent>
    </SheetRoot>
  );
}

// ─── Task row ────────────────────────────────────────────────────────────────

function TaskRow({ task, instanceId }: { task: LifecycleTask; instanceId: string }) {
  const queryClient = useQueryClient();
  const toast = useToast();

  function invalidate() {
    void queryClient.invalidateQueries({ queryKey: ["lifecycle-instances"] });
    void queryClient.invalidateQueries({ queryKey: ["lifecycle-instance", instanceId] });
  }

  const completeMutation = useMutation<LifecycleInstance, AxiosError<{ message?: string }>, void>({
    mutationFn: () =>
      apiClient
        .post<LifecycleInstance>(`/api/v1/employees/lifecycle/tasks/${task.id}/complete`)
        .then((r) => r.data),
    onSuccess: () => { invalidate(); toast("Task completed", "success"); },
    onError: (err) => toast(err.response?.data?.message ?? "Could not complete this task. Please try again.", "error"),
  });

  const skipMutation = useMutation<LifecycleInstance, AxiosError<{ message?: string }>, void>({
    mutationFn: () =>
      apiClient
        .post<LifecycleInstance>(`/api/v1/employees/lifecycle/tasks/${task.id}/skip`)
        .then((r) => r.data),
    onSuccess: () => { invalidate(); toast("Task skipped", "success"); },
    onError: (err) => toast(err.response?.data?.message ?? "Could not skip this task. Please try again.", "error"),
  });

  const busy = completeMutation.isPending || skipMutation.isPending;
  const isOpen = task.status === "OPEN";

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          {task.status === "DONE" ? (
            <CircleCheck size={16} className="text-brand-700 flex-shrink-0 mt-0.5" aria-hidden="true" />
          ) : task.status === "SKIPPED" ? (
            <MinusCircle size={16} className="text-neutral-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
          ) : (
            <span className="mt-1 w-3 h-3 rounded-full border-2 border-neutral-300 flex-shrink-0" aria-hidden="true" />
          )}
          <div className="min-w-0">
            <p className="text-[13.5px] font-semibold text-near-black">{task.title}</p>
            {task.description && (
              <p className="text-[12.5px] text-neutral-500 mt-0.5">{task.description}</p>
            )}
          </div>
        </div>
        <Badge status={taskBadgeStatus(task.status)}>{taskStatusLabel(task.status)}</Badge>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 pl-6 text-[12px] text-neutral-500">
        <span>{ASSIGNEE_ROLE_LABELS[task.assigneeRole]}</span>
        <span>·</span>
        <span>{formatDueDate(task.dueDate)}</span>
        {task.completionType === "DOCUMENT_UPLOAD" && (
          <span className="inline-flex items-center gap-1 text-neutral-500">
            <FileText size={12} aria-hidden="true" />
            {COMPLETION_TYPE_LABELS.DOCUMENT_UPLOAD}
          </span>
        )}
      </div>

      {/* Actions — soft-gated to ADMIN / HR_MANAGER; backend also enforces. */}
      {isOpen && (
        <PermissionGate anyOf={["ADMIN", "HR_MANAGER"]}>
          <div className="flex items-center gap-2 mt-3 pl-6">
            <Button
              variant="primary"
              size="sm"
              disabled={busy}
              onClick={() => completeMutation.mutate()}
            >
              <Check size={14} aria-hidden="true" />
              {completeMutation.isPending ? "Completing…" : "Complete"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={busy}
              onClick={() => skipMutation.mutate()}
            >
              <SkipForward size={14} aria-hidden="true" />
              {skipMutation.isPending ? "Skipping…" : "Skip"}
            </Button>
          </div>
        </PermissionGate>
      )}
    </div>
  );
}
