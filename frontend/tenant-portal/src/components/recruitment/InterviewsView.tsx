"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { CalendarClock } from "lucide-react";
import {
  PageHeader, Button, Badge, BaseModal, DataTable, EmptyState, PermissionGate, useToast,
  formatDate, formatTime,
} from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { ListErrorState } from "@/components/ListErrorState";
import { useEmployeeNames } from "@/hooks/useEmployeeNames";
import {
  useInterviews, usePostings, useApplicants, recruitmentKeys,
} from "@/hooks/useRecruitment";
import {
  INTERVIEW_MODE_OPTIONS,
  INTERVIEW_MODE_LABELS,
  INTERVIEW_STATUS_LABELS,
  interviewBadgeStatus,
  type CreateInterviewInput,
  type Interview,
  type InterviewMode,
} from "@/types/recruitment";

const BASE = "/api/v1/recruitment/interviews";

interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
}

function useEmployeeOptions() {
  return useQuery<EmployeeOption[]>({
    queryKey: ["recruitment-interviewers"],
    queryFn: () =>
      apiClient
        .get<{ content: EmployeeOption[] }>("/api/v1/employees", { params: { size: 500, sort: "firstName,asc" } })
        .then((r) => r.data.content),
    staleTime: 60_000,
  });
}

export function InterviewsView() {
  const { data, isLoading, isError, error, refetch } = useInterviews();
  const { nameFor } = useEmployeeNames();
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const interviews = data ?? [];

  const columns = [
    { key: "when", label: "Scheduled" },
    { key: "interviewer", label: "Interviewer" },
    { key: "mode", label: "Mode" },
    { key: "location", label: "Location" },
    { key: "status", label: "Status" },
  ];

  const rows = interviews.map((iv) => ({
    when: (
      <span className="font-medium text-near-black">
        {formatDate(iv.scheduledAt)} · {formatTime(iv.scheduledAt)}
      </span>
    ),
    interviewer: nameFor(iv.interviewerEmployeeId),
    mode: iv.mode ? INTERVIEW_MODE_LABELS[iv.mode] : "—",
    location: iv.location ?? "—",
    status: <Badge status={interviewBadgeStatus(iv.status)}>{INTERVIEW_STATUS_LABELS[iv.status]}</Badge>,
  }));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Interviews"
        subtitle={isLoading ? "Loading…" : `${interviews.length} interview${interviews.length === 1 ? "" : "s"}`}
        actions={
          <PermissionGate anyOf={["ADMIN", "HR_MANAGER"]}>
            <Button variant="cta" onClick={() => setScheduleOpen(true)}>
              <CalendarClock size={15} aria-hidden="true" />
              Schedule interview
            </Button>
          </PermissionGate>
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-6">
        {isError ? (
          <ListErrorState error={error} noun="interviews" onRetry={() => void refetch()} />
        ) : !isLoading && interviews.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No interviews scheduled"
            description="Schedule an interview for a candidate and assign an interviewer."
          />
        ) : (
          <DataTable columns={columns} rows={rows} isLoading={isLoading} emptyMessage="No interviews" />
        )}
      </div>

      {scheduleOpen && <ScheduleInterviewModal onClose={() => setScheduleOpen(false)} />}
    </div>
  );
}

// ─── Schedule modal ──────────────────────────────────────────────────────────

const inputCls =
  "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900";

function ScheduleInterviewModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const postingsQuery = usePostings();
  const employeesQuery = useEmployeeOptions();

  const [postingId, setPostingId] = useState("");
  const [applicantId, setApplicantId] = useState("");
  const [interviewerEmployeeId, setInterviewerEmployeeId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [mode, setMode] = useState<InterviewMode>("ONSITE");
  const [location, setLocation] = useState("");

  // Applicants load once a posting is chosen (the hook is disabled until then).
  const applicantsQuery = useApplicants(postingId);

  const create = useMutation<Interview, AxiosError<{ message?: string }>, void>({
    mutationFn: () => {
      const body: CreateInterviewInput = {
        applicantId,
        interviewerEmployeeId,
        scheduledAt: new Date(scheduledAt).toISOString(),
        mode,
        location: location.trim() || null,
      };
      return apiClient.post<Interview>(BASE, body).then((r) => r.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recruitmentKeys.interviews });
      toast("Interview scheduled", "success");
      onClose();
    },
    onError: (err) => toast(err.response?.data?.message ?? "Could not schedule interview.", "error"),
  });

  const canSave =
    postingId !== "" && applicantId !== "" && interviewerEmployeeId !== "" && scheduledAt !== "";

  return (
    <BaseModal labelId="schedule-interview-title" onClose={onClose} maxWidth="max-w-lg">
      <h2 id="schedule-interview-title" className="text-[16px] font-bold text-near-black mb-4">Schedule interview</h2>

      <div className="space-y-3">
        <div>
          <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Job posting</label>
          <select
            value={postingId}
            onChange={(e) => { setPostingId(e.target.value); setApplicantId(""); }}
            className={inputCls}
            disabled={create.isPending}
          >
            <option value="">Select posting</option>
            {(postingsQuery.data ?? []).map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Candidate</label>
          <select
            value={applicantId}
            onChange={(e) => setApplicantId(e.target.value)}
            className={inputCls}
            disabled={create.isPending || !postingId || applicantsQuery.isLoading}
          >
            <option value="">
              {!postingId
                ? "Select a posting first"
                : applicantsQuery.isLoading
                ? "Loading candidates…"
                : "Select candidate"}
            </option>
            {(applicantsQuery.data ?? []).map((a) => (
              <option key={a.id} value={a.id}>{a.firstName} {a.lastName}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Interviewer</label>
          <select
            value={interviewerEmployeeId}
            onChange={(e) => setInterviewerEmployeeId(e.target.value)}
            className={inputCls}
            disabled={create.isPending || employeesQuery.isLoading}
          >
            <option value="">{employeesQuery.isLoading ? "Loading employees…" : "Select interviewer"}</option>
            {(employeesQuery.data ?? []).map((e) => (
              <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Date & time</label>
            <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)} className={inputCls} disabled={create.isPending} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Mode</label>
            <select value={mode} onChange={(e) => setMode(e.target.value as InterviewMode)} className={inputCls} disabled={create.isPending}>
              {INTERVIEW_MODE_OPTIONS.map((m) => (
                <option key={m} value={m}>{INTERVIEW_MODE_LABELS[m]}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Location</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls} disabled={create.isPending} placeholder="Optional (e.g. Boardroom, or a video link)" />
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-5">
        <Button variant="outline" onClick={onClose} disabled={create.isPending}>Cancel</Button>
        <Button variant="primary" onClick={() => create.mutate()} disabled={!canSave || create.isPending}>
          {create.isPending ? "Scheduling…" : "Schedule interview"}
        </Button>
      </div>
    </BaseModal>
  );
}
