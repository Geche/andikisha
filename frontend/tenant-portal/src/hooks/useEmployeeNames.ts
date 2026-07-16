"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface EmployeeSummary {
  id: string;
  firstName: string;
  lastName: string;
}

interface PagedResponse<T> {
  content: T[];
}

/**
 * Resolves employeeId → "First Last" for the lifecycle boards. A lifecycle
 * instance carries only employeeId, so we fetch the tenant's employee list once
 * (a single call, cached) and build a lookup Map rather than issuing one request
 * per instance. SME-scale tenants fit comfortably in one large page.
 */
export function useEmployeeNames() {
  const query = useQuery<Map<string, string>>({
    queryKey: ["employee-name-map"],
    queryFn: async () => {
      const res = await apiClient.get<PagedResponse<EmployeeSummary>>("/api/v1/employees", {
        params: { size: 500, sort: "firstName,asc" },
      });
      const map = new Map<string, string>();
      for (const e of res.data.content) {
        map.set(e.id, `${e.firstName} ${e.lastName}`.trim());
      }
      return map;
    },
    staleTime: 60_000,
  });

  const nameFor = (employeeId: string): string =>
    query.data?.get(employeeId) ?? "Unknown employee";

  return { nameFor, isLoading: query.isLoading };
}
