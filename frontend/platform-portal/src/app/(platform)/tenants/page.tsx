"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Building2, Search, Plus } from "lucide-react";
import {
  PageHeader,
  DataTable,
  Badge,
  InlineAlert,
  Button,
  Spinner,
} from "@andikisha/ui";
import type { BadgeStatus } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";

// ─── Types ────────────────────────────────────────────────────────────────────

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

interface PagedResponse {
  content: TenantSummary[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

type TenantStatus = "ALL" | "ACTIVE" | "TRIAL" | "SUSPENDED" | "CANCELLED";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status: string): BadgeStatus {
  switch (status.toUpperCase()) {
    case "ACTIVE":    return "approved";
    case "TRIAL":     return "calculating";
    case "SUSPENDED": return "cancelled";
    case "CANCELLED": return "cancelled";
    default:          return "draft";
  }
}

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// ─── Status tabs ──────────────────────────────────────────────────────────────

const STATUS_TABS: { label: string; value: TenantStatus }[] = [
  { label: "All",       value: "ALL" },
  { label: "Active",    value: "ACTIVE" },
  { label: "Trial",     value: "TRIAL" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "Cancelled", value: "CANCELLED" },
];

function StatusTabs({
  active,
  onChange,
}: {
  active: TenantStatus;
  onChange: (v: TenantStatus) => void;
}) {
  return (
    <div className="flex gap-0 border-b border-neutral-200">
      {STATUS_TABS.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={
            "px-4 py-2.5 text-[13px] font-semibold border-b-2 -mb-px transition-colors " +
            (active === tab.value
              ? "border-b-brand-900 text-neutral-900"
              : "border-b-transparent text-neutral-500 hover:text-neutral-800")
          }
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 25;

export default function TenantsPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<TenantStatus>("ALL");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");

  const statusParam = statusFilter === "ALL" ? undefined : statusFilter;

  const { data, isLoading, isError } = useQuery<PagedResponse>({
    queryKey: ["tenants", { page, size: PAGE_SIZE, status: statusParam }],
    queryFn: () =>
      apiClient
        .get("/api/v1/super-admin/tenants", {
          params: { page, size: PAGE_SIZE, sort: "createdAt,desc", ...(statusParam ? { status: statusParam } : {}) },
        })
        .then((r) => r.data),
    refetchOnWindowFocus: true,
  });

  // Client-side search on the visible page
  const filtered = useMemo(() => {
    const rows = data?.content ?? [];
    if (!search.trim()) return rows;
    const q = search.toLowerCase();
    return rows.filter(
      (t) =>
        t.organisationName.toLowerCase().includes(q) ||
        t.adminEmail.toLowerCase().includes(q) ||
        t.planName.toLowerCase().includes(q)
    );
  }, [data?.content, search]);

  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const fromRow = page * PAGE_SIZE + 1;
  const toRow = Math.min(fromRow + PAGE_SIZE - 1, total);

  const tableRows = filtered.map((t) => ({
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
    seats: (
      <span className="text-[13px] text-neutral-600 tabular-nums">
        {t.seatCount ?? "—"}
      </span>
    ),
    endDate: (
      <span className="text-[13px] text-neutral-500">{fmtDate(t.endDate)}</span>
    ),
    email: (
      <span className="text-[12px] text-neutral-500 truncate max-w-[180px] block">
        {t.adminEmail}
      </span>
    ),
    joined: (
      <span className="text-[13px] text-neutral-500">{fmtDate(t.createdAt)}</span>
    ),
    _id: t.tenantId,
  }));

  function handleStatusChange(v: TenantStatus) {
    setStatusFilter(v);
    setPage(0);
    setSearch("");
  }

  return (
    <>
      <PageHeader
        title="Tenants"
        actions={
          <Button
            onClick={() => router.push("/tenants/new")}
            size="sm"
          >
            <Plus size={14} className="mr-1" />
            Provision Tenant
          </Button>
        }
      />

      <div className="px-8 py-6 flex flex-col gap-4">
        {isError && (
          <InlineAlert variant="error">
            Failed to load tenants. Check backend service connectivity.
          </InlineAlert>
        )}

        <div className="bg-surface border border-neutral-200 rounded-xl overflow-hidden">
          {/* Tabs + search bar */}
          <div className="flex items-center justify-between px-5 pt-4 gap-4">
            <StatusTabs active={statusFilter} onChange={handleStatusChange} />
            <div className="relative flex-shrink-0">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
              />
              <input
                type="text"
                placeholder="Search by name, email, or plan…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-2 text-[13px] border border-neutral-200 rounded-lg bg-surface focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber w-[280px]"
              />
            </div>
          </div>

          {/* Table */}
          <DataTable
            columns={[
              { key: "name",    label: "Organisation" },
              { key: "plan",    label: "Plan" },
              { key: "status",  label: "Status" },
              { key: "seats",   label: "Seats",    align: "right" },
              { key: "endDate", label: "End date" },
              { key: "email",   label: "Admin email" },
              { key: "joined",  label: "Joined" },
            ]}
            rows={tableRows}
            isLoading={isLoading}
            emptyMessage={
              search
                ? `No tenants match "${search}".`
                : statusFilter !== "ALL"
                ? `No tenants with status "${statusFilter.toLowerCase()}".`
                : "No tenants yet. Provision the first tenant to get started."
            }
            onRowClick={(row) => {
              const id = row["_id"];
              if (typeof id === "string") router.push(`/tenants/${id}`);
            }}
            className="border-0 rounded-none"
          />

          {/* Pagination footer */}
          {!isLoading && total > 0 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-100 text-[13px] text-neutral-500">
              <span>
                Showing {fromRow}–{toRow} of {total.toLocaleString()} tenants
              </span>
              <div className="flex items-center gap-2">
                <button
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 text-[12px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors"
                >
                  Previous
                </button>
                <span className="px-2">
                  {page + 1} / {totalPages}
                </span>
                <button
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1.5 rounded-lg border border-neutral-200 text-[12px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Empty state with CTA when no tenants at all */}
          {!isLoading && total === 0 && statusFilter === "ALL" && !search && (
            <div className="flex flex-col items-center gap-3 py-16 text-center">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                <Building2 size={22} className="text-neutral-400" />
              </div>
              <p className="text-[15px] font-semibold text-neutral-700">No tenants yet</p>
              <p className="text-[13px] text-neutral-500">
                Provision the first tenant to get started.
              </p>
              <Button
                size="sm"
                onClick={() => router.push("/tenants/new")}
                className="mt-1"
              >
                <Plus size={14} className="mr-1" />
                Provision Tenant
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
