"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@andikisha/ui";
import { ADMIN_ROLES, findCorrectDashboard } from "@andikisha/ui/auth";

type AuthStatus = "loading" | "authorized" | "redirecting";

function checkAuthorized(roles: Set<string>, area: "employee" | "admin"): boolean {
  return area === "employee"
    ? roles.has("EMPLOYEE")
    : [...ADMIN_ROLES].some((r) => roles.has(r));
}

/**
 * Client-side role guard.
 *
 * When the user is already in the React Query cache (client-side navigation),
 * the role check fires synchronously on the first render — no flash.
 *
 * When the user is null (SSR or cold load), we return "authorized" so the
 * server HTML and client first-paint match, then apply the check after mount
 * to avoid a hydration mismatch.
 */
export function useRoleGuard(area: "employee" | "admin"): AuthStatus {
  const user = useCurrentUser();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const roles = user
    ? new Set<string>(user.roles.flatMap((r) => (r ? [r] : [])))
    : null;

  const authorized = roles ? checkAuthorized(roles, area) : null;

  useEffect(() => {
    if (authorized === false && roles) {
      router.replace(findCorrectDashboard(roles));
    }
  }, [authorized, roles, router]);

  // User is known — check role immediately regardless of mount state.
  // This handles client-side navigation where the cache is already populated.
  if (user !== null && user !== undefined) {
    if (!authorized) return "redirecting";
    return "authorized";
  }

  // User unknown (SSR / cold load) — be permissive until mounted so that
  // server HTML and client first paint are identical (no hydration mismatch).
  // After mount, if user is still null, show loading.
  if (!mounted) return "authorized";
  return "loading";
}
