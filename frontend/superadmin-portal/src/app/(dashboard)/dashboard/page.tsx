"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Building2, CheckCircle, Clock, XCircle, AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/PageHeader";
import { AlertBanner } from "@/components/layout/AlertBanner";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { TenantGrowthChart } from "@/components/dashboard/TenantGrowthChart";
import type { GrowthPeriod } from "@/components/dashboard/TenantGrowthChart";
import { TenantTable } from "@/components/dashboard/TenantTable";
import { TrialsExpiringSoon } from "@/components/dashboard/TrialsExpiringSoon";
import type { DashboardMetrics, TenantGrowthPoint } from "@/types/dashboard";
import type { PagedResponse, TenantSummary } from "@/types/tenant";

function MetricSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-[18px] animate-pulse">
      <div className="h-3 bg-gray-100 rounded w-24 mb-4" />
      <div className="h-8 bg-gray-100 rounded w-16" />
    </div>
  );
}

function QueryError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
      <AlertTriangle size={15} className="flex-shrink-0" />
      {message}
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [growthPeriod, setGrowthPeriod] = useState<GrowthPeriod>("12m");

  const now = new Date();
  const subtitle =
    now.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) +
    " · " +
    now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) +
    " EAT · Production";

  const { data: metrics, isLoading: metricsLoading, isError: metricsError } =
    useQuery<DashboardMetrics>({
      queryKey: ["dashboard-metrics"],
      queryFn: () => apiClient.get("/api/v1/super-admin/dashboard/metrics").then((r) => r.data),
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
        .get("/api/v1/super-admin/tenants", { params: { status: "TRIAL", sort: "endDate,asc", size: 5 } })
        .then((r) => r.data.content),
  });

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Dashboard"
        subtitle={subtitle}
        actions={
          <>
            <button className="flex items-center gap-1.5 border border-gray-200 text-gray-600 font-semibold text-[13.5px] h-9 px-3.5 rounded-lg hover:bg-gray-50 transition-colors">
              Export report
            </button>
            <a
              href="/tenants/new"
              className="flex items-center gap-1.5 bg-[#E8A020] hover:bg-[#C98510] text-[#02110C] font-bold text-[13.5px] h-9 px-3.5 rounded-lg transition-colors"
            >
              + New Tenant
            </a>
          </>
        }
      />

      <AlertBanner
        count={metrics?.trialsExpiringIn48Hours ?? 0}
        onReview={() => router.push("/tenants?status=TRIAL")}
      />

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-6">

        {/* Metric cards */}
        {metricsError ? (
          <QueryError message="Could not load dashboard metrics. Check the tenant-service connection." />
        ) : (
          <div className="grid grid-cols-4 gap-5">
            {metricsLoading ? (
              Array.from({ length: 4 }).map((_, i) => <MetricSkeleton key={i} />)
            ) : (
              <>
                <MetricCard
                  label="Total Tenants"
                  value={metrics?.totalTenants ?? 0}
                  delta={`↑ ${metrics?.tenantDeltaThisMonth ?? 0} this month`}
                  deltaVariant="up"
                  icon={Building2}
                  colorVariant="brand"
                />
                <MetricCard
                  label="Active"
                  value={metrics?.activeTenants ?? 0}
                  delta={`↑ ${metrics?.activeDeltaThisMonth ?? 0} from last month`}
                  deltaVariant="up"
                  icon={CheckCircle}
                  colorVariant="green"
                />
                <MetricCard
                  label="Trials Expiring (7d)"
                  value={metrics?.trialsExpiringIn7Days ?? 0}
                  delta={`⚠ ${metrics?.trialsExpiringIn48Hours ?? 0} expire in 48h`}
                  deltaVariant="warn"
                  icon={Clock}
                  colorVariant="amber"
                />
                <MetricCard
                  label="Suspended"
                  value={metrics?.suspendedTenants ?? 0}
                  delta={metrics?.suspendedTenants ? "Needs attention" : "All clear"}
                  deltaVariant={metrics?.suspendedTenants ? "down" : "up"}
                  icon={XCircle}
                  colorVariant="red"
                />
              </>
            )}
          </div>
        )}

        {/* Growth chart */}
        {growthError ? (
          <QueryError message="Could not load growth data." />
        ) : growthLoading ? (
          <div className="bg-white border border-gray-200 rounded-xl h-[320px] animate-pulse" />
        ) : (
          <TenantGrowthChart data={growth ?? []} onPeriodChange={setGrowthPeriod} />
        )}

        {/* Table + trials */}
        {tenantsError ? (
          <QueryError message="Could not load tenant list. Check the tenant-service connection." />
        ) : (
          <div className="grid grid-cols-3 gap-5">
            <div className="col-span-2">
              <TenantTable
                tenants={tenants?.content ?? []}
                total={tenants?.totalElements ?? 0}
                page={page}
                pageSize={10}
                onPageChange={setPage}
                isLoading={tenantsLoading}
              />
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
