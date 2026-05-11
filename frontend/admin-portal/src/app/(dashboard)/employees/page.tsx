"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { AlertTriangle, Search } from "lucide-react";
import { PageHeader } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";

// ─── Types ───────────────────────────────────────────────────────────────────

type EmploymentType = "PERMANENT" | "CONTRACT" | "CASUAL" | "INTERN";
type EmployeeStatus = "ACTIVE" | "TERMINATED" | "ON_LEAVE" | "PROBATION";

interface EmployeeSummary {
  id: string;
  tenantId: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  kraPin: string;
  department: string | null;
  jobTitle: string | null;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  hireDate: string;
  createdAt: string;
}

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

type StatusFilter = "ALL" | EmployeeStatus;

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Terminated", value: "TERMINATED" },
  { label: "On Leave", value: "ON_LEAVE" },
  { label: "Probation", value: "PROBATION" },
];

function statusBadgeClass(status: EmployeeStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-[#D1F5E6] text-[#0F5040]";
    case "TERMINATED":
      return "bg-gray-100 text-gray-500";
    case "ON_LEAVE":
      return "bg-[#FEF3DC] text-[#92600A]";
    case "PROBATION":
      return "bg-blue-50 text-blue-700";
  }
}

function statusLabel(status: EmployeeStatus): string {
  switch (status) {
    case "ON_LEAVE":
      return "On Leave";
    default:
      return status.charAt(0) + status.slice(1).toLowerCase();
  }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
      <div className="h-11 bg-gray-50 border-b border-gray-200" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-[58px] border-b border-gray-100 last:border-0 flex items-center px-6 gap-6"
        >
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="h-3 bg-gray-100 rounded w-28" />
            <div className="h-2.5 bg-gray-100 rounded w-40" />
          </div>
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="h-3 bg-gray-100 rounded w-24" />
          <div className="h-3 bg-gray-100 rounded w-24" />
          <div className="h-5 bg-gray-100 rounded-full w-20" />
          <div className="h-5 bg-gray-100 rounded-full w-16" />
          <div className="h-3 bg-gray-100 rounded w-20" />
          <div className="h-3 bg-gray-100 rounded w-12" />
        </div>
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function EmployeesPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Simple debounce via timeout ref
  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(0);
    clearTimeout((handleSearchChange as { _t?: ReturnType<typeof setTimeout> })._t);
    (handleSearchChange as { _t?: ReturnType<typeof setTimeout> })._t = setTimeout(() => {
      setDebouncedSearch(val);
    }, 350);
  }

  const { data, isLoading, isError, refetch } = useQuery<PagedResponse<EmployeeSummary>>({
    queryKey: ["employees", page, status, debouncedSearch],
    queryFn: () => {
      const params: Record<string, string | number> = {
        page,
        size: 25,
        sort: "createdAt,desc",
      };
      if (status !== "ALL") params.status = status;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      return apiClient.get("/api/v1/employees", { params }).then((r) => r.data);
    },
  });

  const employees = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  function handleTabChange(val: StatusFilter) {
    setStatus(val);
    setPage(0);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Employees"
        subtitle={isLoading ? "Loading…" : `${totalElements.toLocaleString()} employee${totalElements !== 1 ? "s" : ""}`}
        actions={
          <Link
            href="/employees/new"
            className="flex items-center gap-1.5 bg-[#E8A020] hover:bg-[#C98510] text-[#02110C] font-bold text-[13.5px] h-9 px-3.5 rounded-lg transition-colors"
          >
            + Add Employee
          </Link>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-8 flex flex-col gap-4">
        {/* Search + filter row */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-[13px] text-[#02110C] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] w-64"
            />
          </div>

          {/* Status tabs */}
          <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={`px-3.5 py-2 text-[12.5px] font-semibold transition-colors ${
                  status === tab.value
                    ? "bg-[#0B3D2E] text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {isError && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
            <AlertTriangle size={15} className="flex-shrink-0" />
            <span className="flex-1">Could not load employees. Check your connection.</span>
            <button
              onClick={() => void refetch()}
              className="ml-auto text-[12px] font-semibold underline underline-offset-2 hover:opacity-80"
            >
              Retry
            </button>
          </div>
        )}

        {/* Table */}
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Name
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Employee #
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Department
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Job Title
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Type
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Hire Date
                  </th>
                  <th className="text-left px-6 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-16 text-center text-[13px] text-gray-400">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-[#F8F7F4] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-[#02110C]">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-[12px] text-gray-400 mt-0.5">{emp.email}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono text-[12px]">
                        {emp.employeeNumber}
                      </td>
                      <td className="px-6 py-4 text-gray-600">{emp.department ?? "—"}</td>
                      <td className="px-6 py-4 text-gray-600">{emp.jobTitle ?? "—"}</td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                          {emp.employmentType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusBadgeClass(emp.status)}`}
                        >
                          {statusLabel(emp.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{formatDate(emp.hireDate)}</td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/employees/${emp.id}`}
                          className="text-[12.5px] font-semibold text-[#166A50] hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between text-[13px]">
            <p className="text-gray-500">
              Page {page + 1} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-3.5 py-2 border border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => p + 1)}
                className="px-3.5 py-2 border border-gray-200 rounded-lg font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
