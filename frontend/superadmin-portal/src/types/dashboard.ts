export interface DashboardMetrics {
  totalTenants: number;
  activeTenants: number;
  trialsExpiringIn7Days: number;
  trialsExpiringIn48Hours: number;
  suspendedTenants: number;
  tenantDeltaThisMonth: number;
  activeDeltaThisMonth: number;
}

export interface TenantGrowthPoint {
  month: string;
  newSignups: number;
  activeTenants: number;
}
