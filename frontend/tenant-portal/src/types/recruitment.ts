// Tier-3 domain types for the recruitment module (requisitions, job postings,
// candidate pipeline, interviews, pipeline templates). App-local only — these
// mirror the W2 recruitment-service DTOs and must never move into @andikisha/ui.

// ─── Enums (mirror the recruitment-service domain enums) ─────────────────────

export type EmploymentType = "PERMANENT" | "CONTRACT" | "CASUAL" | "DIRECTOR" | "INTERN";

export type RequisitionStatus = "DRAFT" | "OPEN" | "CLOSED";

export type PostingStatus = "DRAFT" | "PUBLISHED" | "CLOSED";

export type InterviewMode = "ONSITE" | "PHONE" | "VIDEO";

export type InterviewStatus = "SCHEDULED" | "COMPLETED" | "CANCELLED";

export type FeedbackRecommendation = "STRONG_YES" | "YES" | "NO" | "STRONG_NO";

/** APPLIED / HIRED / REJECTED are the protected anchors. */
export type StageCategory = "APPLIED" | "INTERMEDIATE" | "OFFER" | "HIRED" | "REJECTED";

// ─── Money ───────────────────────────────────────────────────────────────────

// Matches MoneyResponse
export interface Money {
  amount: number;
  currency: string;
}

// Matches MoneyInput (amount + currency both required when a Money is present)
export interface MoneyInput {
  amount: number;
  currency: string;
}

// ─── Requisitions ────────────────────────────────────────────────────────────

// Matches RequisitionResponse
export interface Requisition {
  id: string;
  title: string;
  departmentId: string | null;
  positionId: string | null;
  employmentType: EmploymentType;
  salaryMin: Money | null;
  salaryMax: Money | null;
  headcount: number;
  status: RequisitionStatus;
  raisedByEmployeeId: string | null;
  targetStartDate: string | null; // "YYYY-MM-DD"
  description: string | null;
}

// Matches CreateRequisitionRequest
export interface CreateRequisitionInput {
  title: string;
  departmentId: string | null;
  positionId: string | null;
  employmentType: EmploymentType;
  salaryMin: MoneyInput | null;
  salaryMax: MoneyInput | null;
  headcount: number | null;
  targetStartDate: string | null;
  description: string | null;
}

// ─── Job postings ────────────────────────────────────────────────────────────

// Matches PostingResponse
export interface Posting {
  id: string;
  requisitionId: string;
  pipelineTemplateId: string;
  title: string;
  description: string | null;
  location: string | null;
  status: PostingStatus;
  publishedAt: string | null; // ISO instant
  closingDate: string | null; // "YYYY-MM-DD"
}

// Matches CreatePostingRequest
export interface CreatePostingInput {
  requisitionId: string;
  pipelineTemplateId: string;
  title: string;
  description: string | null;
  location: string | null;
  closingDate: string | null;
}

// ─── Applicants ──────────────────────────────────────────────────────────────

// Matches ApplicantResponse
export interface Applicant {
  id: string;
  jobPostingId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  nationalId: string | null;
  kraPin: string | null;
  nhifNumber: string | null;
  nssfNumber: string | null;
  currentStageId: string;
  source: string | null;
  appliedAt: string; // ISO instant
}

// Matches CreateApplicantRequest
export interface CreateApplicantInput {
  jobPostingId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string | null;
  source: string | null;
}

// ─── Pipeline templates ──────────────────────────────────────────────────────

// Matches PipelineStageResponse
export interface PipelineStage {
  id: string;
  orderIndex: number;
  name: string;
  category: StageCategory;
  isProtected: boolean;
}

// Matches PipelineTemplateResponse
export interface PipelineTemplate {
  id: string;
  name: string;
  active: boolean;
  stages: PipelineStage[];
}

// Matches StageInputRequest — id is null for a new stage, set for an existing one.
export interface StageInput {
  id: string | null;
  name: string;
  category: StageCategory;
}

// ─── Interviews ──────────────────────────────────────────────────────────────

// Matches InterviewResponse
export interface Interview {
  id: string;
  applicantId: string;
  scheduledAt: string; // ISO instant
  interviewerEmployeeId: string;
  mode: InterviewMode | null;
  status: InterviewStatus;
  location: string | null;
}

// Matches CreateInterviewRequest
export interface CreateInterviewInput {
  applicantId: string;
  scheduledAt: string; // ISO instant
  interviewerEmployeeId: string;
  mode: InterviewMode | null;
  location: string | null;
}

// ─── Display helpers ─────────────────────────────────────────────────────────

export const EMPLOYMENT_TYPE_OPTIONS: EmploymentType[] = [
  "PERMANENT",
  "CONTRACT",
  "CASUAL",
  "DIRECTOR",
  "INTERN",
];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  PERMANENT: "Permanent",
  CONTRACT: "Contract",
  CASUAL: "Casual",
  DIRECTOR: "Director",
  INTERN: "Intern",
};

export const INTERVIEW_MODE_OPTIONS: InterviewMode[] = ["ONSITE", "PHONE", "VIDEO"];

export const INTERVIEW_MODE_LABELS: Record<InterviewMode, string> = {
  ONSITE: "On-site",
  PHONE: "Phone",
  VIDEO: "Video",
};

export const INTERVIEW_STATUS_LABELS: Record<InterviewStatus, string> = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// Non-anchor categories a tenant may assign to a custom stage.
export const CUSTOM_STAGE_CATEGORY_OPTIONS: StageCategory[] = ["INTERMEDIATE", "OFFER"];

export const STAGE_CATEGORY_LABELS: Record<StageCategory, string> = {
  APPLIED: "Applied",
  INTERMEDIATE: "Intermediate",
  OFFER: "Offer",
  HIRED: "Hired",
  REJECTED: "Rejected",
};

/** Anchor categories are protected: cannot be deleted, category cannot change, position is fixed. */
export function isAnchorCategory(category: StageCategory): boolean {
  return category === "APPLIED" || category === "HIRED" || category === "REJECTED";
}

/** Badge tone for a requisition/posting status, mapped to @andikisha/ui BadgeStatus values. */
export function requisitionBadgeStatus(status: RequisitionStatus): "active" | "draft" | "cancelled" {
  switch (status) {
    case "OPEN":
      return "active";
    case "DRAFT":
      return "draft";
    case "CLOSED":
      return "cancelled";
  }
}

export function postingBadgeStatus(status: PostingStatus): "active" | "draft" | "cancelled" {
  switch (status) {
    case "PUBLISHED":
      return "active";
    case "DRAFT":
      return "draft";
    case "CLOSED":
      return "cancelled";
  }
}

export function interviewBadgeStatus(status: InterviewStatus): "active" | "approved" | "cancelled" {
  switch (status) {
    case "SCHEDULED":
      return "active";
    case "COMPLETED":
      return "approved";
    case "CANCELLED":
      return "cancelled";
  }
}
