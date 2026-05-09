"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/PageHeader";
import { TenantTable } from "@/components/dashboard/TenantTable";
import type { PagedResponse, TenantSummary, TenantStatus } from "@/types/tenant";

const STATUS_TABS: { label: string; value: TenantStatus | "ALL" }[] = [
  { label: "All",       value: "ALL" },
  { label: "Active",    value: "ACTIVE" },
  { label: "Trial",     value: "TRIAL" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "Cancelled", value: "CANCELLED" },
];

function QueryError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
      <AlertTriangle size={15} className="flex-shrink-0" />
      {message}
    </div>
  );
}

export default function TenantsPage() {
  const [statusFilter, setStatusFilter] = useState<TenantStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useQuery<PagedResponse<TenantSummary>>({
    queryKey: ["tenants-list", statusFilter, page],
    queryFn: () =>
      apiClient
        .get("/api/v1/super-admin/tenants", {
          params: {
            ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
            page,
            size: 25,
            sort: "createdAt,desc",
          },
        })
        .then((r) => r.data),
  });

  function handleStatusChange(status: TenantStatus | "ALL") {
    setStatusFilter(status);
    setPage(0);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Tenants"
        subtitle={`${data?.totalElements ?? "…"} total tenants across all plans`}
        actions={
          <Link
            href="/tenants/new"
            className="flex items-center gap-1.5 bg-[#E8A020] hover:bg-[#C98510] text-[#02110C] font-bold text-[13.5px] h-9 px-3.5 rounded-lg transition-colors"
          >
            + New Tenant
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleStatusChange(tab.value)}
              className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors -mb-px ${
                statusFilter === tab.value
                  ? "border-[#0B3D2E] text-[#0B3D2E]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isError ? (
          <QueryError message="Could not load tenants. Check the tenant-service connection." />
        ) : (
          <TenantTable
            tenants={data?.content ?? []}
            total={data?.totalElements ?? 0}
            page={page}
            pageSize={25}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
