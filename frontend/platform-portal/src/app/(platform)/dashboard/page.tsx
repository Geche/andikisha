"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  PageHeader,
  KpiGroup,
  StatCard,
  DataTable,
  Badge,
  InlineAlert,
  MoneyAmount,
} from "@andikisha/ui";
import type { BadgeStatus } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardMetrics {
  totalTenants: number;
  activeTenants: number;
  trialsExpiringIn7Days: number;
  trialsExpiringIn48Hours: number;
  trialsExpiringIn14Days: number;
  suspendedTenants: number;
  tenantDeltaThisMonth: number;
  activeDeltaThisMonth: number;
}

interface TenantSummary {
  tenantId: string;
  organisationName: string;
  status: string;
  planName: string;
  seatCount: number | null;
  endDate: string | null;
  adminEmail: string;
  createdAt: string;
}

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
}

interface ServiceHealth {
  name: string;
  status: "UP" | "DOWN" | "UNKNOWN";
}

interface SystemHealth {
  services: ServiceHealth[];
}

interface Analytics {
  mrrKes: number;
  arrKes: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusBadge(status: string): BadgeStatus {
  switch (status.toUpperCase()) {
    case "ACTIVE": return "approved";
    case "TRIAL": return "calculating";
    case "SUSPENDED": return "cancelled";
    case "CANCELLED": return "cancelled";
    default: return "draft";
  }
}

function trialsCardVariant(expiring7: number, expiring48: number): string {
  if (expiring48 > 0) return "border-error bg-red-50";
  if (expiring7 > 0) return "border-amber bg-amber-light";
  return "";
}

// ─── ServiceHealthGrid ───────────────────────────────────────────────────────

function ServiceHealthGrid({
  services,
  isLoading,
  onServiceClick,
}: {
  services: ServiceHealth[];
  isLoading: boolean;
  onServiceClick: () => void;
}) {
  const dotColor = (status: string) => {
    if (status === "UP") return "bg-brand-500";
    if (status === "DOWN") return "bg-error";
    return "bg-neutral-300";
  };

  const placeholder: ServiceHealth[] = [
    "auth-service", "employee-service", "tenant-service", "payroll-service",
    "compliance-service", "time-attendance-service", "leave-service",
    "document-service", "notification-service", "integration-hub-service",
    "analytics-service", "audit-service", "api-gateway",
  ].map((name) => ({ name, status: "UNKNOWN" as const }));

  const rows = isLoading ? placeholder : services.length ? services : placeholder;

  return (
    <button
      onClick={onServiceClick}
      className="w-full text-left bg-surface border border-neutral-200 rounded-xl p-5 hover:border-neutral-300 transition-colors"
    >
      <p className="text-[12px] font-semibold uppercase tracking-wide text-neutral-500 mb-4">
        Platform Health
      </p>
      <div className="flex flex-col gap-2">
        {rows.map((svc) => (
          <div key={svc.name} className="flex items-center gap-2.5">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dotColor(svc.status)}`} />
            <span className="text-[13px] text-neutral-700 truncate">{svc.name}</span>
            {svc.status === "DOWN" && (
              <span className="ml-auto text-[11px] font-semibold text-error">DOWN</span>
            )}
          </div>
        ))}
      </div>
    </button>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter();

  const { data: metrics, isLoading: metricsLoading, isError: metricsError } =
    useQuery<DashboardMetrics>({
      queryKey: ["platform-metrics"],
      queryFn: () =>
        apiClient.get("/api/v1/super-admin/dashboard/metrics").then((r) => r.data),
      refetchInterval: 60_000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: true,
    });

  const { data: tenantsData, isLoading: tenantsLoading, isError: tenantsError } =
    useQuery<PagedResponse<TenantSummary>>({
      queryKey: ["platform-recent-tenants"],
      queryFn: () =>
        apiClient
          .get("/api/v1/super-admin/tenants", {
            params: { size: 10, sort: "createdAt,desc" },
          })
          .then((r) => r.data),
      refetchInterval: 60_000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: true,
    });

  const { data: healthData, isLoading: healthLoading } =
    useQuery<SystemHealth>({
      queryKey: ["platform-system-health"],
      queryFn: () =>
        apiClient.get("/api/v1/super-admin/system/health").then((r) => r.data),
      refetchInterval: 30_000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: true,
    });

  const { data: analytics, isLoading: analyticsLoading } =
    useQuery<Analytics>({
      queryKey: ["platform-analytics"],
      queryFn: () =>
        apiClient.get("/api/v1/super-admin/analytics").then((r) => r.data),
      refetchInterval: 60_000,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: true,
    });

  const expiring7 = metrics?.trialsExpiringIn7Days ?? 0;
  const expiring48 = metrics?.trialsExpiringIn48Hours ?? 0;
  const trialsVariant = trialsCardVariant(expiring7, expiring48);

  const tableRows = (tenantsData?.content ?? []).map((t) => ({
    name: (
      <span className="font-semibold text-near-black truncate max-w-[200px] block">
        {t.organisationName}
      </span>
    ),
    plan: <span className="text-[13px] text-neutral-600">{t.planName}</span>,
    status: (
      <Badge status={statusBadge(t.status)}>
        {t.status.charAt(0) + t.status.slice(1).toLowerCase()}
      </Badge>
    ),
    email: (
      <span className="text-[12px] text-neutral-500 truncate max-w-[180px] block">
        {t.adminEmail}
      </span>
    ),
    created: new Date(t.createdAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    _id: t.tenantId,
  }));

  return (
    <>
      <PageHeader title="Platform Dashboard" />

      <div className="px-8 py-8 flex flex-col gap-6">
        {(metricsError || tenantsError) && (
          <InlineAlert variant="error">
            Could not load some dashboard data. Check backend service connectivity.
          </InlineAlert>
        )}

        {/* KPI strip — Widgets 1, 2, 3 */}
        <KpiGroup cols={3}>
          {/* Widget 1 — Active Tenants */}
          <button
            onClick={() => router.push("/tenants")}
            className="text-left"
          >
            <StatCard
              label="Active Tenants"
              value={metricsLoading ? "—" : (metrics?.activeTenants ?? 0).toLocaleString()}
              change={
                !metricsLoading && metrics?.activeDeltaThisMonth != null
                  ? `+${metrics.activeDeltaThisMonth} this month`
                  : undefined
              }
              positive
              sub={metricsLoading ? undefined : `${metrics?.totalTenants ?? 0} total tenants`}
            />
          </button>

          {/* Widget 2 — Trials Expiring */}
          <button
            onClick={() => router.push("/tenants?status=TRIAL")}
            className="text-left"
          >
            <StatCard
              label="Trials Expiring (14 days)"
              value={metricsLoading ? "—" : (metrics?.trialsExpiringIn14Days ?? 0).toLocaleString()}
              sub={
                metricsLoading
                  ? undefined
                  : `${expiring7} expiring in 7 days`
              }
              className={trialsVariant}
            />
          </button>

          {/* Widget 3 — MRR */}
          <button
            onClick={() => router.push("/billing")}
            className="text-left"
          >
            <StatCard
              label="Contracted MRR"
              value={
                analyticsLoading ? "—" : (
                  <MoneyAmount amount={analytics?.mrrKes ?? null} size="xl" />
                )
              }
              sub={analyticsLoading ? undefined : "Collected: —"}
            />
          </button>
        </KpiGroup>

        {/* Lower section — Widget 4 (left) + Widget 5 (right) */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-8">
          {/* Widget 4 — Recent Tenant Signups */}
          <div className="lg:col-span-5 bg-surface border border-neutral-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
              <p className="text-[14px] font-bold text-near-black">Recent Tenant Signups</p>
              <button
                onClick={() => router.push("/tenants")}
                className="text-[12px] font-semibold text-brand-700 hover:underline"
              >
                View all →
              </button>
            </div>
            <DataTable
              columns={[
                { key: "name", label: "Organisation" },
                { key: "plan", label: "Plan" },
                { key: "status", label: "Status" },
                { key: "email", label: "Admin email" },
                { key: "created", label: "Joined" },
              ]}
              rows={tableRows}
              isLoading={tenantsLoading}
              emptyMessage="No tenants yet. Provision the first tenant to get started."
              onRowClick={(row) => {
                const id = row["_id"];
                if (typeof id === "string") router.push(`/tenants/${id}`);
              }}
              className="border-0 rounded-none overflow-visible"
            />
          </div>

          {/* Widget 5 — Platform Health Grid */}
          <div className="lg:col-span-3">
            <ServiceHealthGrid
              services={healthData?.services ?? []}
              isLoading={healthLoading}
              onServiceClick={() => router.push("/system")}
            />
          </div>
        </div>
      </div>
    </>
  );
}
