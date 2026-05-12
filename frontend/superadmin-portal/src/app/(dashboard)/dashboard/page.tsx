"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { AlertBanner } from "@/components/layout/AlertBanner";
import { TenantGrowthChart } from "@/components/dashboard/TenantGrowthChart";
import type { GrowthPeriod } from "@/components/dashboard/TenantGrowthChart";
import { TrialsExpiringSoon } from "@/components/dashboard/TrialsExpiringSoon";
import type { DashboardMetrics, TenantGrowthPoint } from "@/types/dashboard";
import type { PagedResponse, TenantSummary } from "@/types/tenant";
import {
  PageHeader,
  KpiGroup,
  StatCard,
  DataTable,
  Badge,
  Button,
  InlineAlert,
} from "@andikisha/ui";
import type { BadgeStatus } from "@andikisha/ui";

function tenantStatusBadge(status: string): BadgeStatus {
  switch (status) {
    case "ACTIVE":    return "active";
    case "TRIAL":     return "trial";
    case "SUSPENDED": return "suspended";
    case "CANCELLED": return "cancelled";
    default:          return "inactive";
  }
}

export default function DashboardPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [growthPeriod, setGrowthPeriod] = useState<GrowthPeriod>("12m");

  const now = new Date();
  const subtitle =
    now.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }) +
    " · " +
    now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) +
    " EAT · Production";

  const { data: metrics, isLoading: metricsLoading, isError: metricsError } =
    useQuery<DashboardMetrics>({
      queryKey: ["dashboard-metrics"],
      queryFn: () =>
        apiClient.get("/api/v1/super-admin/dashboard/metrics").then((r) => r.data),
    });

  const { data: growth, isLoading: growthLoading, isError: growthError } =
    useQuery<TenantGrowthPoint[]>({
      queryKey: ["tenant-growth", growthPeriod],
      queryFn: () =>
        apiClient
          .get("/api/v1/super-admin/dashboard/growth", { params: { period: growthPeriod } })
          .then((r) => r.data),
    });

  const { data: tenants, isLoading: tenantsLoading, isError: tenantsError } =
    useQuery<PagedResponse<TenantSummary>>({
      queryKey: ["tenants-list", page],
      queryFn: () =>
        apiClient
          .get("/api/v1/super-admin/tenants", { params: { page, size: 10 } })
          .then((r) => r.data),
    });

  const { data: expiringTrials } = useQuery<TenantSummary[]>({
    queryKey: ["expiring-trials"],
    queryFn: () =>
      apiClient
        .get("/api/v1/super-admin/tenants", {
          params: { status: "TRIAL", sort: "endDate,asc", size: 5 },
        })
        .then((r) => r.data.content),
  });

  const tenantRows = (tenants?.content ?? []).map((t) => ({
    tenant: (
      <span className="font-medium text-near-black">{t.organisationName}</span>
    ),
    plan: t.planName,
    status: (
      <Badge status={tenantStatusBadge(t.status)}>
        {t.status.charAt(0) + t.status.slice(1).toLowerCase()}
      </Badge>
    ),
    created: new Date(t.createdAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    _id: t.tenantId,
  }));

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Dashboard"
        subtitle={subtitle}
        actions={
          <>
            <Button variant="outline">Export report</Button>
            <Button variant="cta" onClick={() => router.push("/tenants/new")}>
              + New Tenant
            </Button>
          </>
        }
      />

      <AlertBanner
        count={metrics?.trialsExpiringIn48Hours ?? 0}
        onReview={() => router.push("/tenants?status=TRIAL")}
      />

      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-6">
        {/* KPI strip */}
        {metricsError ? (
          <InlineAlert variant="error">
            Could not load dashboard metrics. Check the tenant-service connection.
          </InlineAlert>
        ) : (
          <KpiGroup cols={4}>
            {metricsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <StatCard key={i} label="Loading" value="—" />
              ))
            ) : (
              <>
                <StatCard
                  label="Active Tenants"
                  value={metrics?.activeTenants ?? 0}
                  change={
                    metrics && metrics.activeDeltaThisMonth > 0
                      ? `↑ ${metrics.activeDeltaThisMonth} this month`
                      : undefined
                  }
                  positive={true}
                  sub={`${metrics?.totalTenants ?? 0} total`}
                />
                <StatCard
                  label="MRR"
                  value="—"
                  sub="Billing not wired"
                />
                <StatCard
                  label="Failed Filings 24h"
                  value="—"
                  sub="Compliance not wired"
                />
                <StatCard
                  label="Open Incidents"
                  value="0"
                  sub="All systems nominal"
                />
              </>
            )}
          </KpiGroup>
        )}

        {/* Growth chart */}
        {growthError ? (
          <InlineAlert variant="error">Could not load growth data.</InlineAlert>
        ) : growthLoading ? (
          <div className="bg-surface border border-[#E5E7EB] rounded-xl h-[320px] animate-pulse" />
        ) : (
          <TenantGrowthChart data={growth ?? []} onPeriodChange={setGrowthPeriod} />
        )}

        {/* Tenant table + expiring trials */}
        {tenantsError ? (
          <InlineAlert variant="error">
            Could not load tenant list. Check the tenant-service connection.
          </InlineAlert>
        ) : (
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2 flex flex-col gap-0">
              <div className="bg-surface border border-[#E5E7EB] rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#F3F4F6] flex items-center justify-between">
                  <p className="text-[14px] font-bold text-near-black">
                    Recent Tenants
                  </p>
                  <button
                    onClick={() => router.push("/tenants")}
                    className="text-[12px] font-semibold text-brand-800 hover:underline"
                  >
                    View all →
                  </button>
                </div>
                <DataTable
                  columns={[
                    { key: "tenant", label: "Tenant" },
                    { key: "plan", label: "Plan" },
                    { key: "status", label: "Status" },
                    { key: "created", label: "Created" },
                  ]}
                  rows={tenantRows}
                  isLoading={tenantsLoading}
                  emptyMessage="No tenants yet"
                  onRowClick={(row) => {
                    const id = row["_id"];
                    if (typeof id === "string") router.push(`/tenants/${id}`);
                  }}
                  className="border-0 rounded-none"
                />
              </div>
            </div>
            <div>
              <TrialsExpiringSoon tenants={expiringTrials ?? []} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
