// Tier-3 domain types for the employee lifecycle (onboarding / offboarding)
// pipeline. App-local only — these mirror the W1 employee-service DTOs and must
// never move into @andikisha/ui.

export type LifecycleType = "ONBOARDING" | "OFFBOARDING";

export type LifecycleInstanceStatus =
  | "PENDING"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "COMPLETED"
  | "CANCELLED";

export type LifecycleTaskStatus = "OPEN" | "DONE" | "SKIPPED";

export type LifecycleAssigneeRole =
  | "HR_OFFICER"
  | "LINE_MANAGER"
  | "EMPLOYEE"
  | "ADMIN"
  | "HR_MANAGER";

export type LifecycleCompletionType = "MANUAL" | "DOCUMENT_UPLOAD";

// Matches LifecycleTaskResponse
export interface LifecycleTask {
  id: string;
  title: string;
  description: string | null;
  assigneeRole: LifecycleAssigneeRole;
  dueDate: string | null; // "YYYY-MM-DD"
  status: LifecycleTaskStatus;
  completionType: LifecycleCompletionType;
  completedBy: string | null;
  completedAt: string | null; // ISO instant
  documentId: string | null;
}

// Matches LifecycleInstanceResponse
export interface LifecycleInstance {
  id: string;
  employeeId: string;
  templateId: string;
  type: LifecycleType;
  status: LifecycleInstanceStatus;
  startedAt: string; // ISO instant
  completedAt: string | null;
  initiatedBy: string;
  systemNote: string | null;
  completedTaskCount: number;
  totalTaskCount: number;
  tasks: LifecycleTask[];
}

// Matches LifecycleTaskDefinitionResponse
export interface LifecycleTaskDefinition {
  id: string;
  orderIndex: number;
  title: string;
  description: string | null;
  assigneeRole: LifecycleAssigneeRole;
  completionType: LifecycleCompletionType;
  dueOffsetDays: number | null;
}

// Matches LifecycleTemplateResponse
export interface LifecycleTemplate {
  id: string;
  type: LifecycleType;
  name: string;
  active: boolean;
  applicableEmploymentTypes: string[];
  tasks: LifecycleTaskDefinition[];
}

// Request body for POST/PUT templates
export interface LifecycleTaskDefinitionInput {
  title: string;
  description: string | null;
  assigneeRole: LifecycleAssigneeRole;
  completionType: LifecycleCompletionType;
  dueOffsetDays: number | null;
}

export interface LifecycleTemplateInput {
  type: LifecycleType;
  name: string;
  applicableEmploymentTypes: string[];
  tasks: LifecycleTaskDefinitionInput[];
}

// ─── Display helpers ─────────────────────────────────────────────────────────

export const ASSIGNEE_ROLE_LABELS: Record<LifecycleAssigneeRole, string> = {
  HR_OFFICER: "HR officer",
  LINE_MANAGER: "Line manager",
  EMPLOYEE: "Employee",
  ADMIN: "Admin",
  HR_MANAGER: "HR manager",
};

export const ASSIGNEE_ROLE_OPTIONS: LifecycleAssigneeRole[] = [
  "HR_OFFICER",
  "HR_MANAGER",
  "LINE_MANAGER",
  "ADMIN",
  "EMPLOYEE",
];

export const COMPLETION_TYPE_LABELS: Record<LifecycleCompletionType, string> = {
  MANUAL: "Manual",
  DOCUMENT_UPLOAD: "Document upload",
};
