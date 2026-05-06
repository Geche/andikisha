export type TenantStatus = "TRIAL" | "ACTIVE" | "SUSPENDED" | "ONBOARDING" | "CANCELLED";

export interface TenantSummary {
  id: string;
  companyName: string;
  slug: string;
  adminEmail: string;
  plan: string;
  status: TenantStatus;
  employeeCount: number | null;
  createdAt: string;
  trialExpiresAt: string | null;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
