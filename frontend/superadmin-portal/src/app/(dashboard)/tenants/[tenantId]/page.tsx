"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/PageHeader";
import { OverviewTab } from "@/components/tenants/detail/OverviewTab";
import { LicenceTab } from "@/components/tenants/detail/LicenceTab";
import { FeatureFlagsTab } from "@/components/tenants/detail/FeatureFlagsTab";
import { TenantActionMenu } from "@/components/tenants/detail/TenantActionMenu";
import type { TenantDetail } from "@/types/tenant";

type Tab = "overview" | "onboarding" | "employees" | "licence" | "flags" | "audit";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",   label: "Overview" },
  { id: "onboarding", label: "Onboarding" },
  { id: "employees",  label: "Employees" },
  { id: "licence",    label: "Licence" },
  { id: "flags",      label: "Feature Flags" },
  { id: "audit",      label: "Audit" },
];

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-48 border border-dashed border-gray-200 rounded-xl">
      <p className="text-[13px] text-gray-400">{label} — coming in Phase 2</p>
    </div>
  );
}

interface Props {
  params: Promise<{ tenantId: string }>;
}

export default function TenantDetailPage({ params }: Props) {
  const { tenantId } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data: tenant, isLoading, isError } = useQuery<TenantDetail>({
    queryKey: ["tenant-detail", tenantId],
    queryFn: () =>
      apiClient.get(`/api/v1/super-admin/tenants/${tenantId}`).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <PageHeader title="Loading…" subtitle="" />
        <div className="flex-1 px-8 py-6">
          <div className="max-w-5xl mx-auto space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !tenant) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <PageHeader title="Tenant not found" subtitle="" />
        <div className="flex-1 px-8 py-6">
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
            <AlertTriangle size={15} />
            Could not load tenant details. The tenant may not exist.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title={tenant.organisationName}
        subtitle={`ID: ${tenantId} · ${tenant.adminEmail}`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/tenants")}
              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 font-semibold text-[13.5px] h-9 px-3.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={14} /> Tenants
            </button>
            <TenantActionMenu tenantId={tenantId} status={tenant.status} />
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-gray-200 px-8 flex-shrink-0 bg-white">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-[13px] font-semibold border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? "border-[#0B3D2E] text-[#0B3D2E]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-5xl mx-auto">
          {activeTab === "overview"   && <OverviewTab tenant={tenant} />}
          {activeTab === "onboarding" && <Placeholder label="Onboarding checklist" />}
          {activeTab === "employees"  && <Placeholder label="Employee roster" />}
          {activeTab === "licence"    && <LicenceTab tenantId={tenantId} licence={tenant.currentLicence} />}
          {activeTab === "flags"      && <FeatureFlagsTab tenantId={tenantId} />}
          {activeTab === "audit"      && <Placeholder label="Audit trail" />}
        </div>
      </div>
    </div>
  );
}
