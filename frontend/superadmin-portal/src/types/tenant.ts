export type TenantStatus = "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED" | "DELETED";
export type LicenceStatus = "TRIAL" | "ACTIVE" | "SUSPENDED" | "EXPIRED" | "CANCELLED";
export type BillingCycle = "MONTHLY" | "ANNUAL";

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

export interface TenantDetail {
  tenantId: string;
  organisationName: string;
  status: TenantStatus;
  createdAt: string;
  adminEmail: string;
  adminPhone: string;
  kraPin: string | null;
  nssfNumber: string | null;
  shifNumber: string | null;
  payFrequency: string;
  payDay: number;
  suspensionReason: string | null;
  trialEndsAt: string | null;
  currentLicence: LicenceDetail | null;
}

export interface LicenceDetail {
  licenceId: string;
  tenantId: string;
  planId: string;
  planName: string;
  licenceKey: string;
  billingCycle: BillingCycle;
  seatCount: number;
  agreedPriceKes: number;
  currency: string;
  startDate: string;
  endDate: string | null;
  status: LicenceStatus;
  suspendedAt: string | null;
  createdBy: string;
}

export interface LicenceHistory {
  id: string;
  tenantId: string;
  licenceId: string;
  previousStatus: LicenceStatus;
  newStatus: LicenceStatus;
  changedBy: string;
  changeReason: string | null;
  changedAt: string;
}

export interface FeatureFlag {
  featureKey: string;
  enabled: boolean;
  description: string | null;
}

export interface Plan {
  id: string;
  name: string;
  tier: string;
  monthlyPrice: number;
  currency: string;
  maxEmployees: number;
  maxAdmins: number;
  payrollEnabled: boolean;
  leaveEnabled: boolean;
  attendanceEnabled: boolean;
  documentsEnabled: boolean;
  analyticsEnabled: boolean;
}

export interface ProvisionedTenant {
  tenantId: string;
  organisationName: string;
  licenceKey: string;
  licenceStatus: LicenceStatus;
  planName: string;
  adminEmail: string;
  temporaryPassword: string;
  seatCount: number;
  endDate: string | null;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
