"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@andikisha/ui";
import { ADMIN_ROLES, findCorrectDashboard } from "@andikisha/ui/auth";

/**
 * Client-side complement to middleware role guards.
 * Redirects if the signed-in user navigates client-side into a route
 * area they don't belong in (bypassing the server middleware).
 */
export function useRoleGuard(area: "employee" | "admin") {
  const user = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!user) return;
    const roles = new Set<string>(user.roles.flatMap((r) => (r ? [r] : [])));

    if (area === "employee" && !roles.has("EMPLOYEE")) {
      router.replace(findCorrectDashboard(roles));
      return;
    }

    if (area === "admin") {
      const hasAdminRole = [...ADMIN_ROLES].some((r) => roles.has(r));
      if (!hasAdminRole) {
        router.replace(findCorrectDashboard(roles));
      }
    }
  }, [user, router, area]);
}
