export type TenantStatus = "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED" | "DELETED";

export interface TenantSummary {
  tenantId: string;
  organisationName: string;
  status: TenantStatus;
  planName: string;
  seatCount: number | null;
  endDate: string | null;
  adminEmail: string;
  createdAt: string;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
