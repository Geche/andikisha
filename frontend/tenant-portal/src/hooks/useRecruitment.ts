"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import type {
  Applicant,
  Interview,
  PipelineTemplate,
  Posting,
  Requisition,
} from "@/types/recruitment";

const BASE = "/api/v1/recruitment";

// Shared query keys — one home so mutations across pages invalidate consistently.
export const recruitmentKeys = {
  requisitions: ["recruitment", "requisitions"] as const,
  postings: ["recruitment", "postings"] as const,
  posting: (id: string) => ["recruitment", "posting", id] as const,
  templates: ["recruitment", "pipeline-templates"] as const,
  applicants: (postingId: string) => ["recruitment", "applicants", postingId] as const,
  interviews: ["recruitment", "interviews"] as const,
};

export function useRequisitions() {
  return useQuery<Requisition[]>({
    queryKey: recruitmentKeys.requisitions,
    queryFn: () => apiClient.get<Requisition[]>(`${BASE}/requisitions`).then((r) => r.data),
  });
}

export function usePostings() {
  return useQuery<Posting[]>({
    queryKey: recruitmentKeys.postings,
    queryFn: () => apiClient.get<Posting[]>(`${BASE}/postings`).then((r) => r.data),
  });
}

export function usePosting(id: string) {
  return useQuery<Posting>({
    queryKey: recruitmentKeys.posting(id),
    queryFn: () => apiClient.get<Posting>(`${BASE}/postings/${id}`).then((r) => r.data),
    enabled: !!id,
  });
}

export function usePipelineTemplates() {
  return useQuery<PipelineTemplate[]>({
    queryKey: recruitmentKeys.templates,
    queryFn: () => apiClient.get<PipelineTemplate[]>(`${BASE}/pipeline-templates`).then((r) => r.data),
  });
}

export function useApplicants(postingId: string) {
  return useQuery<Applicant[]>({
    queryKey: recruitmentKeys.applicants(postingId),
    queryFn: () =>
      apiClient.get<Applicant[]>(`${BASE}/postings/${postingId}/applicants`).then((r) => r.data),
    enabled: !!postingId,
  });
}

export function useInterviews() {
  return useQuery<Interview[]>({
    queryKey: recruitmentKeys.interviews,
    queryFn: () => apiClient.get<Interview[]>(`${BASE}/interviews`).then((r) => r.data),
  });
}
