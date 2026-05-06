"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TenantSummary, TenantStatus } from "@/types/tenant";
import { Pencil, Trash2, ChevronLeft, ChevronRight, ChevronsUpDown, Search } from "lucide-react";

const STATUS_STYLES: Record<TenantStatus, string> = {
  ACTIVE:    "bg-[#D1F5E6] text-[#0F5040]",
  TRIAL:     "bg-[#E8F5F0] text-[#166A50] border border-[#D1F5E6]",
  SUSPENDED: "bg-[#FEE2E2] text-[#991B1B]",
  CANCELLED: "bg-gray-100 text-gray-500",
  DELETED:   "bg-gray-100 text-gray-400",
};

function StatusBadge({ status }: { status: TenantStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[status]}`}>
      <span className="w-[5px] h-[5px] rounded-full bg-current" />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w?.[0] ?? "")
    .filter(Boolean)
    .join("")
    .toUpperCase() || "?";
}

const AVATAR_COLORS = [
  "bg-[#D1F5E6] text-[#0B3D2E]",
  "bg-[#FEF3DC] text-[#C98510]",
  "bg-[#E8F5F0] text-[#166A50]",
  "bg-[#FEE2E2] text-[#991B1B]",
  "bg-gray-100 text-gray-600",
];

type SortKey = "organisationName" | "adminEmail" | "createdAt" | "status" | "seatCount";
type SortDir = "asc" | "desc";

interface Props {
  tenants: TenantSummary[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onSort?: (key: SortKey, dir: SortDir) => void;
  isLoading?: boolean;
}

function paginationPages(page: number, totalPages: number): (number | "…")[] {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);
  if (page < 4) return [0, 1, 2, 3, 4, "…", totalPages - 1];
  if (page > totalPages - 5) return [0, "…", totalPages - 5, totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1];
  return [0, "…", page - 1, page, page + 1, "…", totalPages - 1];
}

export function TenantTable({ tenants, total, page, pageSize, onPageChange, onSort, isLoading }: Props) {
  const router = useRouter();
  const [sortKey, setSortKey] = useState<SortKey>("organisationName");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSort(key: SortKey) {
    const dir = sortKey === key && sortDir === "asc" ? "desc" : "asc";
    setSortKey(key);
    setSortDir(dir);
    onSort?.(key, dir);
  }

  const totalPages = Math.ceil(total / pageSize);
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, total);

  function SortHeader({ label, colKey }: { label: string; colKey: SortKey }) {
    const active = sortKey === colKey;
    return (
      <button
        onClick={() => handleSort(colKey)}
        className={`flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.05em] hover:text-gray-700 transition-colors ${active ? "text-[#0B3D2E]" : "text-gray-500"}`}
      >
        {label}
        <ChevronsUpDown size={11} className={active ? "text-[#0B3D2E]" : "text-gray-300"} />
      </button>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <p className="text-[15px] font-bold text-[#101828]">Tenants</p>
          <span className="text-[12px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{total}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-gray-400 w-[200px]">
            <Search size={13} className="opacity-40 flex-shrink-0" />
            <span className="flex-1">Search</span>
            <kbd className="text-[10px] bg-gray-100 rounded px-1.5 py-0.5 text-gray-400">⌘K</kbd>
          </div>
          <a
            href="/tenants/new"
            className="flex items-center gap-1.5 bg-[#E8A020] hover:bg-[#C98510] text-[#02110C] font-semibold text-[13px] px-3.5 h-9 rounded-lg transition-colors"
          >
            + New Tenant
          </a>
        </div>
      </div>
      <table className="w-full border-collapse">
        <thead className="bg-[#FAFAFA]">
          <tr>
            <th className="w-11 px-4 h-11 text-left"><input type="checkbox" className="rounded accent-[#0B3D2E]" /></th>
            <th className="px-4 h-11 text-left"><SortHeader label="Company" colKey="organisationName" /></th>
            <th className="px-4 h-11 text-left"><SortHeader label="Admin email" colKey="adminEmail" /></th>
            <th className="px-4 h-11 text-left"><SortHeader label="Created" colKey="createdAt" /></th>
            <th className="px-4 h-11 text-left"><SortHeader label="Status" colKey="status" /></th>
            <th className="px-4 h-11 text-left"><SortHeader label="Employees" colKey="seatCount" /></th>
            <th className="w-20 px-4 h-11" />
          </tr>
        </thead>
        <tbody>
          {isLoading && Array.from({ length: 5 }).map((_, i) => (
            <tr key={`skeleton-${i}`} className="border-t border-gray-50">
              <td className="px-4 h-[72px]"><div className="w-4 h-4 bg-gray-100 rounded animate-pulse" /></td>
              <td className="px-4 h-[72px]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gray-100 animate-pulse flex-shrink-0" />
                  <div className="space-y-1.5">
                    <div className="h-3 bg-gray-100 rounded w-32 animate-pulse" />
                    <div className="h-2.5 bg-gray-100 rounded w-20 animate-pulse" />
                  </div>
                </div>
              </td>
              {[100, 80, 60, 40].map((w) => (
                <td key={w} className="px-4 h-[72px]"><div className={`h-3 bg-gray-100 rounded w-${w === 100 ? "36" : w === 80 ? "28" : w === 60 ? "16" : "8"} animate-pulse`} /></td>
              ))}
              <td className="px-4 h-[72px]" />
            </tr>
          ))}
          {!isLoading && tenants.length === 0 && (
            <tr>
              <td colSpan={7} className="px-6 py-12 text-center">
                <p className="text-[13.5px] font-semibold text-gray-500">No tenants yet</p>
                <p className="text-[12px] text-gray-400 mt-1">Provision your first tenant to get started.</p>
              </td>
            </tr>
          )}
          {tenants.map((t, i) => (
            <tr
              key={t.tenantId}
              onClick={() => router.push(`/tenants/${t.tenantId}`)}
              className="border-t border-gray-50 hover:bg-gray-50 cursor-pointer group transition-colors"
            >
              <td className="px-4 h-[72px]"><input type="checkbox" className="rounded accent-[#0B3D2E]" /></td>
              <td className="px-4 h-[72px]">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {initials(t.organisationName)}
                  </div>
                  <div>
                    <p className="text-[13.5px] font-semibold text-[#101828]">{t.organisationName}</p>
                    <p className="text-[11.5px] text-gray-400">{t.planName}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 h-[72px] text-[13px] text-gray-500">{t.adminEmail}</td>
              <td className="px-4 h-[72px] text-[13px] text-gray-500">
                {new Date(t.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </td>
              <td className="px-4 h-[72px]"><StatusBadge status={t.status} /></td>
              <td className="px-4 h-[72px] text-[13.5px] text-gray-600">{t.seatCount ?? "—"}</td>
              <td className="px-4 h-[72px]">
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button aria-label="Delete tenant" className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                    <Trash2 size={14} />
                  </button>
                  <button aria-label="Edit tenant" className="w-8 h-8 rounded-md flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors">
                    <Pencil size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-100">
        <p className="text-[13px] text-gray-500">
          {total === 0
            ? "No tenants"
            : <>Showing <strong>{from}–{to}</strong> of <strong>{total}</strong> tenants</>}
        </p>
        {totalPages > 1 && (
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page === 0}
              className="flex items-center gap-1 h-9 px-2.5 rounded-lg text-[13.5px] font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} /> Previous
            </button>
            {paginationPages(page, totalPages).map((p, idx) =>
              p === "…" ? (
                <span key={`ellipsis-${idx}`} className="w-9 text-center text-gray-400 text-[13px]">…</span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p as number)}
                  className={`w-9 h-9 rounded-lg text-[13.5px] font-medium transition-colors ${
                    p === page ? "bg-[#0B3D2E] text-white" : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {(p as number) + 1}
                </button>
              )
            )}
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages - 1}
              className="flex items-center gap-1 h-9 px-2.5 rounded-lg text-[13.5px] font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
