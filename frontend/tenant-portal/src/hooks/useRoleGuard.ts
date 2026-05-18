"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@andikisha/ui";
import { ADMIN_ROLES, findCorrectDashboard } from "@andikisha/ui/auth";

type AuthStatus = "loading" | "authorized" | "redirecting";

/**
 * Client-side role guard. Returns:
 *  - "loading"     — user not yet resolved; caller should render nothing
 *  - "authorized"  — role matches this area; safe to render children
 *  - "redirecting" — wrong role; redirect is in flight; render nothing
 *
 * Complements the server-side middleware guard for client-side navigations.
 */
export function useRoleGuard(area: "employee" | "admin"): AuthStatus {
  const user = useCurrentUser();
  const router = useRouter();

  const roles = user
    ? new Set<string>(user.roles.flatMap((r) => (r ? [r] : [])))
    : null;

  const authorized = roles
    ? area === "employee"
      ? roles.has("EMPLOYEE")
      : [...ADMIN_ROLES].some((r) => roles.has(r))
    : null;

  useEffect(() => {
    if (authorized === false && roles) {
      router.replace(findCorrectDashboard(roles));
    }
  }, [authorized, roles, router]);

  if (!user || authorized === null) return "loading";
  if (!authorized) return "redirecting";
  return "authorized";
}
