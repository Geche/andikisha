"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { CalendarClock } from "lucide-react";
import {
  PageHeader, Button, Badge, BaseModal, DataTable, EmptyState, useToast, useHasRole,
  formatDate, formatTime,
} from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { ListErrorState } from "@/components/ListErrorState";
import { useMyInterviews, recruitmentKeys } from "@/hooks/useRecruitment";
import {
  INTERVIEW_MODE_LABELS,
  INTERVIEW_STATUS_LABELS,
  FEEDBACK_RECOMMENDATION_OPTIONS,
  FEEDBACK_RECOMMENDATION_LABELS,
  interviewBadgeStatus,
  type Interview,
  type FeedbackRecommendation,
  type SubmitFeedbackInput,
} from "@/types/recruitment";

export function MyInterviewsView() {
  const isLineManager = useHasRole("LINE_MANAGER");
  const { data, isLoading, isError, error, refetch } = useMyInterviews(isLineManager);
  const [feedbackTarget, setFeedbackTarget] = useState<Interview | null>(null);

  const interviews = data ?? [];

  const columns = [
    { key: "when", label: "Scheduled" },
    { key: "candidate", label: "Candidate" },
    { key: "mode", label: "Mode" },
    { key: "location", label: "Location" },
    { key: "status", label: "Status" },
    { key: "actions", label: "", align: "right" as const },
  ];

  // InterviewResponse carries only applicantId — there is no LINE_MANAGER-scoped
  // read to resolve a candidate name, so a short reference is the honest display.
  const rows = interviews.map((iv) => ({
    when: (
      <span className="font-medium text-near-black">
        {formatDate(iv.scheduledAt)} · {formatTime(iv.scheduledAt)}
      </span>
    ),
    candidate: <span className="font-mono text-[12px] text-neutral-500">#{iv.applicantId.slice(0, 8)}</span>,
    mode: iv.mode ? INTERVIEW_MODE_LABELS[iv.mode] : "—",
    location: iv.location ?? "—",
    status: <Badge status={interviewBadgeStatus(iv.status)}>{INTERVIEW_STATUS_LABELS[iv.status]}</Badge>,
    actions:
      iv.status === "CANCELLED" ? (
        <span className="text-[12.5px] text-neutral-400">—</span>
      ) : (
        <button
          onClick={() => setFeedbackTarget(iv)}
          className="text-[12.5px] font-semibold text-brand-700 hover:underline"
        >
          Submit feedback
        </button>
      ),
  }));

  if (!isLineManager) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <PageHeader title="My interviews" subtitle="Interviews assigned to you" />
        <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8">
          <EmptyState
            icon={CalendarClock}
            title="Not available"
            description="Interview assignments are available to line managers only."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="My interviews"
        subtitle={isLoading ? "Loading…" : `${interviews.length} interview${interviews.length === 1 ? "" : "s"}`}
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
        {isError ? (
          <ListErrorState error={error} noun="interviews" onRetry={() => void refetch()} />
        ) : !isLoading && interviews.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No interviews assigned"
            description="When HR assigns you as an interviewer, the interview appears here for you to give feedback."
          />
        ) : (
          <DataTable columns={columns} rows={rows} isLoading={isLoading} emptyMessage="No interviews" />
        )}
      </div>

      {feedbackTarget && (
        <FeedbackModal interview={feedbackTarget} onClose={() => setFeedbackTarget(null)} />
      )}
    </div>
  );
}

// ─── Feedback modal ──────────────────────────────────────────────────────────

const inputCls =
  "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 disabled:opacity-60";

const RATINGS = [1, 2, 3, 4, 5] as const;

function FeedbackModal({ interview, onClose }: { interview: Interview; onClose: () => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [rating, setRating] = useState<number>(0);
  const [recommendation, setRecommendation] = useState<FeedbackRecommendation | "">("");
  const [comments, setComments] = useState("");

  const submit = useMutation<void, AxiosError<{ message?: string }>, void>({
    mutationFn: () => {
      const body: SubmitFeedbackInput = {
        rating,
        recommendation: recommendation === "" ? null : recommendation,
        comments: comments.trim() || null,
      };
      return apiClient
        .post(`/api/v1/recruitment/interviews/${interview.id}/feedback`, body)
        .then(() => undefined);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recruitmentKeys.myInterviews });
      toast("Feedback submitted", "success");
      onClose();
    },
    // Form-B ownership path: server returns NOT_OWNER if the caller is not the
    // assigned interviewer — surface that message verbatim.
    onError: (err) => toast(err.response?.data?.message ?? "Could not submit feedback.", "error"),
  });

  const canSave = rating >= 1 && rating <= 5 && !submit.isPending;

  return (
    <BaseModal labelId="feedback-title" onClose={onClose} maxWidth="max-w-md">
      <h2 id="feedback-title" className="text-[16px] font-bold text-near-black mb-1">
        Interview feedback
      </h2>
      <p className="text-[12.5px] text-neutral-500 mb-4">
        {formatDate(interview.scheduledAt)} · {formatTime(interview.scheduledAt)}
      </p>

      <div className="space-y-4">
        <div>
          <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Rating</label>
          <div className="inline-flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
            {RATINGS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRating(r)}
                disabled={submit.isPending}
                aria-pressed={rating === r}
                className={
                  "w-9 h-8 text-[13px] font-semibold rounded-md transition-all " +
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-900/50 " +
                  (rating === r
                    ? "bg-surface text-near-black shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700")
                }
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
            Recommendation
          </label>
          <select
            value={recommendation}
            onChange={(e) => setRecommendation(e.target.value as FeedbackRecommendation | "")}
            className={inputCls}
            disabled={submit.isPending}
          >
            <option value="">No recommendation</option>
            {FEEDBACK_RECOMMENDATION_OPTIONS.map((r) => (
              <option key={r} value={r}>
                {FEEDBACK_RECOMMENDATION_LABELS[r]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Comments</label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            rows={4}
            className={`${inputCls} resize-none`}
            disabled={submit.isPending}
            placeholder="What stood out? Optional."
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-5">
        <Button variant="outline" onClick={onClose} disabled={submit.isPending}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => submit.mutate()} disabled={!canSave}>
          {submit.isPending ? "Submitting…" : "Submit feedback"}
        </Button>
      </div>
    </BaseModal>
  );
}
