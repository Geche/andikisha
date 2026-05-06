"use client";

import type { TenantSummary, TenantStatus } from "@/types/tenant";
import { Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

const STATUS_STYLES: Record<TenantStatus, string> = {
  ACTIVE:     "bg-[#D1F5E6] text-[#0F5040]",
  TRIAL:      "bg-[#E8F5F0] text-[#166A50] border border-[#D1F5E6]",
  ONBOARDING: "bg-[#FEF3DC] text-[#C98510]",
  SUSPENDED:  "bg-[#FEE2E2] text-[#991B1B]",
  CANCELLED:  "bg-gray-100 text-gray-500",
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
  return name.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase();
}

const AVATAR_COLORS = [
  "bg-[#D1F5E6] text-[#0B3D2E]",
  "bg-[#FEF3DC] text-[#C98510]",
  "bg-[#E8F5F0] text-[#166A50]",
  "bg-[#FEE2E2] text-[#991B1B]",
  "bg-gray-100 text-gray-600",
];

interface Props {
  tenants: TenantSummary[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}

export function TenantTable({ tenants, total, page, pageSize, onPageChange }: Props) {
  const totalPages = Math.ceil(total / pageSize);
  const from = page * pageSize + 1;
  const to = Math.min((page + 1) * pageSize, total);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <p className="text-[15px] font-bold text-[#101828]">Tenants</p>
          <span className="text-[12px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{total}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5 text-[13px] text-gray-400 w-[200px]">
            <svg className="w-3.5 h-3.5 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            Search
            <kbd className="ml-auto text-[10px] bg-gray-100 rounded px-1.5 py-0.5 text-gray-400">⌘K</kbd>
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
            <th className="px-4 h-11 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.05em]">Company</th>
            <th className="px-4 h-11 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.05em]">Admin email</th>
            <th className="px-4 h-11 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.05em]">Created</th>
            <th className="px-4 h-11 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.05em]">Status</th>
            <th className="px-4 h-11 text-left text-[11px] font-bold text-gray-500 uppercase tracking-[0.05em]">Employees</th>
            <th className="w-20 px-4 h-11" />
          </tr>
        </thead>
        <tbody>
          {tenants.map((t, i) => (
            <tr key={t.id} className="border-t border-gray-50 hover:bg-gray-50 cursor-pointer group transition-colors">
              <td className="px-4 h-[72px]"><input type="checkbox" className="rounded accent-[#0B3D2E]" /></td>
              <td className="px-4 h-[72px]">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                    {initials(t.companyName)}
                  </div>
                  <div>
                    <p className="text-[13.5px] font-semibold text-[#101828]">{t.companyName}</p>
                    <p className="text-[11.5px] text-gray-400">@{t.slug}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 h-[72px] text-[13px] text-gray-500">{t.adminEmail}</td>
              <td className="px-4 h-[72px] text-[13px] text-gray-500">
                {new Date(t.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
              </td>
              <td className="px-4 h-[72px]"><StatusBadge status={t.status} /></td>
              <td className="px-4 h-[72px] text-[13.5px] text-gray-600">{t.employeeCount ?? "—"}</td>
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
          Showing <strong>{from}–{to}</strong> of <strong>{total}</strong> tenants
        </p>
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            className="flex items-center gap-1 h-9 px-2.5 rounded-lg text-[13.5px] font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft size={14} /> Previous
          </button>
          {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => (
            <button
              key={i}
              onClick={() => onPageChange(i)}
              className={`w-9 h-9 rounded-lg text-[13.5px] font-medium transition-colors ${
                i === page ? "bg-[#0B3D2E] text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages - 1}
            className="flex items-center gap-1 h-9 px-2.5 rounded-lg text-[13.5px] font-medium text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
