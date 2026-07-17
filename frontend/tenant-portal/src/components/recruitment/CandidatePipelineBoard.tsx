"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { ArrowLeft, Plus, Mail, MoveRight, Send } from "lucide-react";
import {
  PageHeader, Badge, Button, BaseModal, Skeleton, EmptyState, PermissionGate, useToast,
} from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { ListErrorState } from "@/components/ListErrorState";
import { useWorkspace } from "@/hooks/useWorkspace";
import {
  usePosting, usePipelineTemplates, useApplicants, recruitmentKeys,
} from "@/hooks/useRecruitment";
import {
  type Applicant,
  type CreateApplicantInput,
  type PipelineStage,
  type PipelineTemplate,
  type Posting,
} from "@/types/recruitment";

const BASE = "/api/v1/recruitment";

interface CandidatePipelineBoardProps {
  postingId: string;
}

export function CandidatePipelineBoard({ postingId }: CandidatePipelineBoardProps) {
  const workspace = useWorkspace();

  const postingQuery = usePosting(postingId);
  const templatesQuery = usePipelineTemplates();
  const applicantsQuery = useApplicants(postingId);

  const posting = postingQuery.data;
  const template: PipelineTemplate | undefined = useMemo(
    () => templatesQuery.data?.find((t) => t.id === posting?.pipelineTemplateId),
    [templatesQuery.data, posting?.pipelineTemplateId],
  );

  const [addOpen, setAddOpen] = useState(false);

  const isLoading = postingQuery.isLoading || templatesQuery.isLoading || applicantsQuery.isLoading;
  const isError = postingQuery.isError || templatesQuery.isError || applicantsQuery.isError;

  const stages: PipelineStage[] = useMemo(
    () => (template ? [...template.stages].sort((a, b) => a.orderIndex - b.orderIndex) : []),
    [template],
  );
  const applicants = applicantsQuery.data ?? [];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title={posting?.title ?? "Candidate pipeline"}
        subtitle={posting ? subtitleFor(posting, applicants.length) : isLoading ? "Loading…" : undefined}
        actions={
          posting && (
            <div className="flex items-center gap-2">
              {posting.status === "DRAFT" && (
                <PermissionGate anyOf={["ADMIN", "HR_MANAGER"]}>
                  <PublishButton postingId={posting.id} />
                </PermissionGate>
              )}
              <PermissionGate anyOf={["ADMIN", "HR_MANAGER"]}>
                <Button variant="cta" onClick={() => setAddOpen(true)}>
                  <Plus size={15} aria-hidden="true" />
                  Add candidate
                </Button>
              </PermissionGate>
            </div>
          )
        }
      />

      <div className="flex-1 min-h-0 overflow-hidden px-8 py-6 flex flex-col">
        <Link
          href={`/${workspace}/admin/recruitment/postings`}
          className="inline-flex items-center gap-1.5 text-[13px] text-neutral-500 hover:text-near-black transition-colors mb-5 flex-shrink-0"
        >
          <ArrowLeft size={14} aria-hidden="true" />
          Job postings
        </Link>

        {isError ? (
          <ListErrorState
            error={postingQuery.error ?? templatesQuery.error ?? applicantsQuery.error}
            noun="the candidate pipeline"
            onRetry={() => {
              void postingQuery.refetch();
              void templatesQuery.refetch();
              void applicantsQuery.refetch();
            }}
          />
        ) : isLoading ? (
          <BoardSkeleton />
        ) : !template ? (
          <EmptyState
            icon={MoveRight}
            title="Pipeline unavailable"
            description="The pipeline template for this posting could not be loaded."
          />
        ) : (
          /* Dynamic, variable-count columns. A horizontal-scroll flex row of fixed-width
             columns survives a template with 6+ stages — never a hardcoded grid. */
          <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-4 h-full items-stretch pb-2">
              {stages.map((stage) => {
                const inStage = applicants.filter((a) => a.currentStageId === stage.id);
                return (
                  <section key={stage.id} className="w-72 shrink-0 flex flex-col min-h-0">
                    <header className="flex items-center justify-between gap-2 px-0.5 pb-2 mb-3 border-b border-neutral-200 flex-shrink-0">
                      <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 truncate">
                        {stage.name}
                      </span>
                      <span className="text-[11px] font-semibold text-neutral-400 font-mono tabular-nums">
                        {inStage.length}
                      </span>
                    </header>
                    <div className="flex flex-col gap-2.5 overflow-y-auto pr-1">
                      {inStage.length === 0 ? (
                        <p className="px-1 py-8 text-center text-[12px] text-neutral-300">Nothing here</p>
                      ) : (
                        inStage.map((applicant) => (
                          <ApplicantCard
                            key={applicant.id}
                            applicant={applicant}
                            stages={stages}
                            postingId={postingId}
                          />
                        ))
                      )}
                    </div>
                  </section>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {addOpen && posting && (
        <AddCandidateModal postingId={posting.id} onClose={() => setAddOpen(false)} />
      )}
    </div>
  );
}

function subtitleFor(posting: Posting, count: number): string {
  const parts = [`${count} candidate${count === 1 ? "" : "s"}`];
  if (posting.location) parts.push(posting.location);
  return parts.join(" · ");
}

// ─── Applicant card ──────────────────────────────────────────────────────────

function ApplicantCard({
  applicant,
  stages,
  postingId,
}: {
  applicant: Applicant;
  stages: PipelineStage[];
  postingId: string;
}) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const move = useMutation<Applicant, AxiosError<{ message?: string }>, string>({
    mutationFn: (toStageId) =>
      apiClient
        .post<Applicant>(`${BASE}/applicants/${applicant.id}/move`, { toStageId, note: null })
        .then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicants(postingId) });
    },
    onError: (err) => toast(err.response?.data?.message ?? "Could not move this candidate.", "error"),
  });

  const otherStages = stages.filter((s) => s.id !== applicant.currentStageId);

  return (
    <div className="rounded-xl bg-white border border-neutral-200 shadow-sm p-3.5">
      <p className="text-[13.5px] font-semibold text-near-black truncate">
        {applicant.firstName} {applicant.lastName}
      </p>
      <div className="flex items-center gap-1.5 mt-1 text-[11.5px] text-neutral-500 min-w-0">
        <Mail size={12} aria-hidden="true" className="flex-shrink-0" />
        <span className="truncate">{applicant.email}</span>
      </div>
      {applicant.source && (
        <div className="mt-2">
          <Badge status="draft">{applicant.source}</Badge>
        </div>
      )}

      {/* Move control — gated so HR_OFFICER sees a read-only board. */}
      <PermissionGate anyOf={["ADMIN", "HR_MANAGER"]}>
        {otherStages.length > 0 && (
          <label className="mt-3 flex items-center gap-1.5 text-[11px] text-neutral-400">
            <MoveRight size={13} aria-hidden="true" className="flex-shrink-0" />
            <select
              aria-label={`Move ${applicant.firstName} ${applicant.lastName} to another stage`}
              value=""
              disabled={move.isPending}
              onChange={(e) => {
                if (e.target.value) move.mutate(e.target.value);
              }}
              className="w-full border border-neutral-200 rounded-lg px-2 py-1.5 text-[12px] text-near-black bg-white focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 disabled:opacity-50"
            >
              <option value="">{move.isPending ? "Moving…" : "Move to…"}</option>
              {otherStages.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </label>
        )}
      </PermissionGate>
    </div>
  );
}

// ─── Publish button ──────────────────────────────────────────────────────────

function PublishButton({ postingId }: { postingId: string }) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const publish = useMutation<Posting, AxiosError<{ message?: string }>, void>({
    mutationFn: () => apiClient.post<Posting>(`${BASE}/postings/${postingId}/publish`).then((r) => r.data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recruitmentKeys.posting(postingId) });
      void queryClient.invalidateQueries({ queryKey: recruitmentKeys.postings });
      toast("Posting published", "success");
    },
    onError: (err) => toast(err.response?.data?.message ?? "Could not publish this posting.", "error"),
  });

  return (
    <Button variant="secondary" disabled={publish.isPending} onClick={() => publish.mutate()}>
      <Send size={15} aria-hidden="true" />
      {publish.isPending ? "Publishing…" : "Publish"}
    </Button>
  );
}

// ─── Add candidate modal ─────────────────────────────────────────────────────

const inputCls =
  "w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900";

function AddCandidateModal({ postingId, onClose }: { postingId: string; onClose: () => void }) {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [source, setSource] = useState("");

  const create = useMutation<Applicant, AxiosError<{ message?: string }>, void>({
    mutationFn: () => {
      const body: CreateApplicantInput = {
        jobPostingId: postingId,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim() || null,
        source: source.trim() || null,
      };
      return apiClient.post<Applicant>(`${BASE}/applicants`, body).then((r) => r.data);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: recruitmentKeys.applicants(postingId) });
      toast("Candidate added", "success");
      onClose();
    },
    onError: (err) => toast(err.response?.data?.message ?? "Could not add candidate.", "error"),
  });

  const canSave =
    firstName.trim().length > 0 && lastName.trim().length > 0 && email.trim().length > 0;

  return (
    <BaseModal labelId="add-candidate-title" onClose={onClose} maxWidth="max-w-md">
      <h2 id="add-candidate-title" className="text-[16px] font-bold text-near-black mb-4">
        Add candidate
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">First name</label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} disabled={create.isPending} />
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Last name</label>
          <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} disabled={create.isPending} />
        </div>
      </div>
      <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5 mt-3">Email</label>
      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} disabled={create.isPending} placeholder="name@example.com" />
      <div className="grid grid-cols-2 gap-3 mt-3">
        <div>
          <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Phone</label>
          <input value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className={inputCls} disabled={create.isPending} placeholder="Optional" />
        </div>
        <div>
          <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">Source</label>
          <input value={source} onChange={(e) => setSource(e.target.value)} className={inputCls} disabled={create.isPending} placeholder="e.g. Referral" />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-5">
        <Button variant="outline" onClick={onClose} disabled={create.isPending}>Cancel</Button>
        <Button variant="primary" onClick={() => create.mutate()} disabled={!canSave || create.isPending}>
          {create.isPending ? "Adding…" : "Add candidate"}
        </Button>
      </div>
    </BaseModal>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function BoardSkeleton() {
  return (
    <div className="flex gap-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <section key={i} className="w-72 shrink-0 flex flex-col">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-200">
            <Skeleton pill className="h-2.5 w-20" />
            <Skeleton pill className="h-2.5 w-4" />
          </div>
          <Skeleton className="h-24 rounded-xl" />
        </section>
      ))}
    </div>
  );
}
