"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { Check, ClipboardList, FileText } from "lucide-react";
import { Button, useToast } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { COMPLETION_TYPE_LABELS, type LifecycleTask } from "@/types/lifecycle";
import { formatDueDate } from "./helpers";

/**
 * Employee self-service onboarding card for /my/dashboard. Renders ONLY while the
 * signed-in employee has open EMPLOYEE-assigned onboarding tasks — it returns null
 * during loading (no flash) and null once no open tasks remain (self-dismissing).
 * There is no permanent menu item; the card is the whole surface.
 *
 * DOCUMENT_UPLOAD tasks currently confirm-complete without attaching a file: the
 * tenant-portal has no employee document-upload flow yet (LIFECYCLE-BACKLOG-004).
 * The backend does not require a documentId, so completion is accepted.
 */
export function MyOnboardingCard() {
  const { data, isLoading } = useQuery<LifecycleTask[]>({
    queryKey: ["my-onboarding-tasks"],
    queryFn: () =>
      apiClient
        .get<LifecycleTask[]>("/api/v1/employees/me/lifecycle/onboarding-tasks")
        .then((r) => r.data ?? []),
  });

  // No flash before the query resolves; self-dismiss when nothing is open.
  if (isLoading) return null;
  const openTasks = (data ?? []).filter((t) => t.status === "OPEN");
  if (openTasks.length === 0) return null;

  return (
    <section className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-3">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-700 text-white flex-shrink-0">
          <ClipboardList size={16} aria-hidden="true" />
        </span>
        <div>
          <p className="text-[13.5px] font-bold text-neutral-900">Complete your onboarding</p>
          <p className="text-[12px] text-neutral-400 mt-0.5">
            {openTasks.length} task{openTasks.length === 1 ? "" : "s"} remaining
          </p>
        </div>
      </div>
      <div className="divide-y divide-neutral-50">
        {openTasks.map((task) => (
          <OnboardingTaskRow key={task.id} task={task} />
        ))}
      </div>
    </section>
  );
}

function OnboardingTaskRow({ task }: { task: LifecycleTask }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const isUpload = task.completionType === "DOCUMENT_UPLOAD";

  const complete = useMutation<unknown, AxiosError<{ message?: string }>, void>({
    mutationFn: () =>
      apiClient
        .post(`/api/v1/employees/lifecycle/tasks/${task.id}/complete`)
        .then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-onboarding-tasks"] });
      toast("Task completed", "success");
    },
    onError: (err) =>
      toast(
        err.response?.data?.message ?? "Could not complete this task. Please try again.",
        "error",
      ),
  });

  return (
    <div className="px-6 py-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-[13.5px] font-semibold text-neutral-900">{task.title}</p>
        {task.description && (
          <p className="text-[12.5px] text-neutral-500 mt-0.5">{task.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-[12px] text-neutral-400">
          <span>{formatDueDate(task.dueDate)}</span>
          {isUpload && (
            <span className="inline-flex items-center gap-1">
              <FileText size={12} aria-hidden="true" />
              {COMPLETION_TYPE_LABELS.DOCUMENT_UPLOAD}
            </span>
          )}
        </div>
        {isUpload && (
          <p className="text-[12px] text-neutral-400 mt-1.5">
            File upload is coming soon. Bring the document to HR, then mark this done.
          </p>
        )}
      </div>
      <Button
        variant="primary"
        size="sm"
        disabled={complete.isPending}
        onClick={() => complete.mutate()}
        className="flex-shrink-0"
      >
        <Check size={14} aria-hidden="true" />
        {complete.isPending ? "Saving…" : "Mark done"}
      </Button>
    </div>
  );
}
