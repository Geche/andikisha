"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@andikisha/ui";
import { ADMIN_ROLES, findCorrectDashboard } from "@andikisha/ui/auth";

type AuthStatus = "authorized" | "redirecting";

function checkAuthorized(roles: Set<string>, area: "employee" | "admin"): boolean {
  return area === "employee"
    ? roles.has("EMPLOYEE")
    : [...ADMIN_ROLES].some((r) => roles.has(r));
}

/**
 * Client-side role guard. Returns:
 *  - "authorized"  — render children (role confirmed, or user unknown — be permissive)
 *  - "redirecting" — wrong role confirmed; redirect in flight; render nothing
 *
 * Rule: only block when we KNOW the role is wrong. Unknown user = permissive.
 * Middleware enforces auth server-side; this guard only catches client-side
 * navigation that bypasses middleware.
 */
export function useRoleGuard(area: "employee" | "admin"): AuthStatus {
  const user = useCurrentUser();
  const router = useRouter();

  const roles = user
    ? new Set<string>(user.roles.flatMap((r) => (r ? [r] : [])))
    : null;

  const authorized = roles ? checkAuthorized(roles, area) : null;

  useEffect(() => {
    if (authorized === false && roles) {
      router.replace(findCorrectDashboard(roles));
    }
  }, [authorized, roles, router]);

  // Only block rendering when role is definitively wrong.
  // If user is null or still loading, let middleware's server decision stand.
  if (authorized === false) return "redirecting";
  return "authorized";
}
