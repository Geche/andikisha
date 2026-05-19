"use client";

import { use } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2, Clock } from "lucide-react";
import { PageHeader, Button, Badge, Spinner } from "@andikisha/ui";
import type { BadgeStatus } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";

interface TenantDetail {
  tenantId: string;
  organisationName: string;
  status: string;
  adminEmail: string;
  createdAt: string;
}

function statusBadge(status: string): BadgeStatus {
  switch (status.toUpperCase()) {
    case "ACTIVE":    return "approved";
    case "TRIAL":     return "calculating";
    case "SUSPENDED": return "cancelled";
    case "CANCELLED": return "cancelled";
    default:          return "draft";
  }
}

export default function TenantDetailPage({
  params,
}: {
  params: Promise<{ tenantId: string }>;
}) {
  const { tenantId } = use(params);
  const router = useRouter();

  const { data, isLoading } = useQuery<TenantDetail>({
    queryKey: ["tenant", tenantId],
    queryFn: () =>
      apiClient
        .get(`/api/v1/super-admin/tenants/${tenantId}`)
        .then((r) => r.data),
    retry: false,
  });

  const orgName = data?.organisationName ?? (isLoading ? "Loading…" : "Tenant");

  return (
    <>
      <PageHeader
        title={orgName}
        subtitle={`Tenant ID: ${tenantId}`}
        actions={
          <Button variant="secondary" size="sm" onClick={() => router.push("/tenants")}>
            <ArrowLeft size={13} className="mr-1" />
            All Tenants
          </Button>
        }
      />

      <div className="px-8 py-8 flex justify-center">
        <div className="w-full max-w-2xl">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : (
            <>
              {/* Identity strip */}
              {data && (
                <div className="bg-surface border border-neutral-200 rounded-xl p-5 mb-5 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <Building2 size={18} className="text-brand-700" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[15px] font-bold text-near-black truncate">{data.organisationName}</p>
                    <p className="text-[12px] text-neutral-500 truncate">{data.adminEmail}</p>
                  </div>
                  <Badge status={statusBadge(data.status)}>
                    {data.status.charAt(0) + data.status.slice(1).toLowerCase()}
                  </Badge>
                </div>
              )}

              {/* Coming-soon notice */}
              <div className="bg-surface border border-neutral-200 rounded-xl p-8 flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-light flex items-center justify-center">
                  <Clock size={20} className="text-amber" />
                </div>
                <p className="text-[16px] font-bold text-near-black">
                  Tenant detail coming soon
                </p>
                <p className="text-[13px] text-neutral-500 max-w-md leading-relaxed">
                  Full tenant detail — including licence history, billing, suspend/reactivate,
                  extend trial, and feature flags — will appear here in a future release.
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
