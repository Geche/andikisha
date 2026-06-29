"use client";

import { useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, Upload } from "lucide-react";
import { PageHeader, PaginationBar } from "@andikisha/ui";
import { apiClient } from "@/lib/api-client";
import { ListErrorState } from "@/components/ListErrorState";
import { useWorkspace } from "@/hooks/useWorkspace";

// ─── Types ───────────────────────────────────────────────────────────────────

// Matches EmploymentStatus enum in employee-service
type EmployeeStatus = "ACTIVE" | "ON_PROBATION" | "ON_LEAVE" | "TERMINATED";

// Matches EmployeeSummaryResponse record in employee-service
interface EmployeeSummary {
  id: string;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  departmentName: string | null;
  positionTitle: string | null;
  status: EmployeeStatus;
  hireDate: string;
}

interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

// ─── Constants ───────────────────────────────────────────────────────────────

type StatusFilter = "ALL" | EmployeeStatus;

const STATUS_TABS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "ALL" },
  { label: "Active", value: "ACTIVE" },
  { label: "Probation", value: "ON_PROBATION" },
  { label: "On Leave", value: "ON_LEAVE" },
  { label: "Terminated", value: "TERMINATED" },
];

type SortField = "firstName" | "employeeNumber" | "departmentName" | "positionTitle" | "status" | "hireDate";
type SortDir = "asc" | "desc";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function statusBadgeClass(status: EmployeeStatus): string {
  switch (status) {
    case "ACTIVE":
      return "bg-brand-100 text-brand-800";
    case "ON_PROBATION":
      return "bg-blue-50 text-blue-700";
    case "ON_LEAVE":
      return "bg-amber-light text-amber-text";
    case "TERMINATED":
      return "bg-neutral-100 text-neutral-500";
  }
}

function statusLabel(status: EmployeeStatus): string {
  switch (status) {
    case "ON_PROBATION": return "Probation";
    case "ON_LEAVE":     return "On Leave";
    case "TERMINATED":   return "Terminated";
    case "ACTIVE":       return "Active";
  }
}

// Parse "YYYY-MM-DD" safely without UTC ambiguity
function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// ─── Sortable column header ───────────────────────────────────────────────────

function SortHeader({
  label,
  field,
  current,
  dir,
  onSort,
}: {
  label: string;
  field: SortField;
  current: SortField;
  dir: SortDir;
  onSort: (f: SortField) => void;
}) {
  const active = current === field;
  return (
    <th
      className="bg-neutral-50 text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide cursor-pointer select-none hover:text-neutral-800 transition-colors whitespace-nowrap"
      onClick={() => onSort(field)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        {active ? (
          dir === "asc" ? (
            <ChevronUp size={12} className="text-brand-900" />
          ) : (
            <ChevronDown size={12} className="text-brand-900" />
          )
        ) : (
          <ChevronsUpDown size={12} className="text-neutral-300" />
        )}
      </span>
    </th>
  );
}

// ─── Skeleton ────────────────────────────────────────────────────────────────

function TableSkeleton() {
  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden animate-pulse">
      <div className="h-11 bg-neutral-50 border-b border-neutral-200" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="h-[58px] border-b border-neutral-100 last:border-0 flex items-center px-6 gap-6"
        >
          <div className="flex flex-col gap-1.5 flex-1">
            <div className="h-3 bg-neutral-100 rounded w-28" />
            <div className="h-2.5 bg-neutral-100 rounded w-40" />
          </div>
          <div className="h-3 bg-neutral-100 rounded w-20" />
          <div className="h-3 bg-neutral-100 rounded w-24" />
          <div className="h-3 bg-neutral-100 rounded w-24" />
          <div className="h-5 bg-neutral-100 rounded-full w-20" />
          <div className="h-3 bg-neutral-100 rounded w-20" />
          <div className="h-3 bg-neutral-100 rounded w-12" />
        </div>
      ))}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function EmployeesPage() {
  const workspace = useWorkspace();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("hireDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleSearchChange(val: string) {
    setSearch(val);
    setPage(0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(val), 350);
  }

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
    setPage(0);
  }

  function handleTabChange(val: StatusFilter) {
    setStatus(val);
    setPage(0);
  }

  const { data, isLoading, isError, error, refetch } = useQuery<PagedResponse<EmployeeSummary>>({
    queryKey: ["employees", page, pageSize, status, debouncedSearch, sortField, sortDir],
    queryFn: () => {
      const params: Record<string, string | number> = {
        page,
        size: pageSize,
        sort: `${sortField},${sortDir}`,
      };
      if (status !== "ALL") params.status = status;
      if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
      return apiClient.get("/api/v1/employees", { params }).then((r) => r.data);
    },
  });

  const employees = data?.content ?? [];
  const totalElements = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Employees"
        subtitle={
          isLoading
            ? "Loading…"
            : `${totalElements.toLocaleString()} employee${totalElements !== 1 ? "s" : ""}`
        }
        actions={
          <div className="flex items-center gap-2">
            <Link
              href={`/${workspace}/admin/employees/bulk-upload`}
              className="flex items-center gap-1.5 border border-neutral-200 text-near-black font-semibold text-[13.5px] h-9 px-3.5 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <Upload size={15} aria-hidden="true" />
              Import employees
            </Link>
            <Link
              href={`/${workspace}/admin/employees/new`}
              className="flex items-center gap-1.5 bg-amber hover:bg-amber-dark text-near-black font-bold text-[13.5px] h-9 px-3.5 rounded-lg transition-colors"
            >
              + Add Employee
            </Link>
          </div>
        }
      />

      <div className="flex-1 min-h-0 overflow-y-auto px-8 py-8 space-y-4">
        {/* Filter tabs + search row */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => handleTabChange(tab.value)}
                className={
                  "px-3 py-1.5 text-[13px] font-semibold rounded-md transition-all whitespace-nowrap " +
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-900/50 " +
                  (status === tab.value
                    ? "bg-surface text-near-black shadow-sm"
                    : "text-neutral-500 hover:text-neutral-700")
                }
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative flex-shrink-0">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-8 pr-3 py-2 border border-neutral-200 rounded-lg text-[13px] text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 w-64"
            />
          </div>
        </div>

        {/* Error / loading / table are mutually exclusive */}
        {isError ? (
          <ListErrorState error={error} noun="employees" onRetry={() => void refetch()} />
        ) : isLoading ? (
          <TableSkeleton />
        ) : (
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-neutral-100">
                  <SortHeader label="Name"       field="firstName"     current={sortField} dir={sortDir} onSort={handleSort} />
                  <SortHeader label="Employee #" field="employeeNumber" current={sortField} dir={sortDir} onSort={handleSort} />
                  <SortHeader label="Department" field="departmentName" current={sortField} dir={sortDir} onSort={handleSort} />
                  <SortHeader label="Position"   field="positionTitle"  current={sortField} dir={sortDir} onSort={handleSort} />
                  <SortHeader label="Status"     field="status"         current={sortField} dir={sortDir} onSort={handleSort} />
                  <SortHeader label="Hire Date"  field="hireDate"       current={sortField} dir={sortDir} onSort={handleSort} />
                  <th className="bg-neutral-50 text-left px-6 py-3 text-[11px] font-semibold text-neutral-500 uppercase tracking-wide w-16">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center text-[13px] text-neutral-400">
                      No employees found
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="border-b border-neutral-50 last:border-0 hover:bg-surface-alt transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-near-black">
                          {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-[12px] text-neutral-400 mt-0.5">{emp.phoneNumber}</p>
                      </td>
                      <td className="px-6 py-4 text-neutral-600 font-mono text-[12px]">
                        {emp.employeeNumber}
                      </td>
                      <td className="px-6 py-4 text-neutral-600">{emp.departmentName ?? "—"}</td>
                      <td className="px-6 py-4 text-neutral-600">{emp.positionTitle ?? "—"}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusBadgeClass(emp.status)}`}
                        >
                          {statusLabel(emp.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-neutral-500">{formatDate(emp.hireDate)}</td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/${workspace}/admin/employees/${emp.id}`}
                          className="text-[12.5px] font-semibold text-brand-700 hover:underline"
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

        {/* Pagination — hidden while the list failed to load */}
        {!isError && (
          <PaginationBar
            currentPage={page}
            totalPages={totalPages}
            totalCount={totalElements}
            pageSize={pageSize}
            itemLabel="employees"
            onPageChange={setPage}
            onPageSizeChange={(s) => { setPageSize(s); setPage(0); }}
          />
        )}
      </div>
    </div>
  );
}
