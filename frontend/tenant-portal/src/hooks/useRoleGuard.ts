"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@andikisha/ui";
import { ADMIN_ROLES, findCorrectDashboard } from "@andikisha/ui/auth";

type AuthStatus = "loading" | "authorized" | "redirecting";

/**
 * Client-side role guard. Returns:
 *  - "loading"     — not yet mounted or user not resolved; caller renders nothing
 *  - "authorized"  — role matches this area; safe to render children
 *  - "redirecting" — wrong role; redirect in flight; caller renders nothing
 *
 * IMPORTANT: always returns "authorized" during SSR so the server-rendered HTML
 * matches the client's first paint. The guard only activates after mount, which
 * prevents hydration mismatches while still blocking wrong-role content on the
 * client. Middleware handles the server-side enforcement.
 */
export function useRoleGuard(area: "employee" | "admin"): AuthStatus {
  const [mounted, setMounted] = useState(false);
  const user = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const roles = user
    ? new Set<string>(user.roles.flatMap((r) => (r ? [r] : [])))
    : null;

  const authorized = roles
    ? area === "employee"
      ? roles.has("EMPLOYEE")
      : [...ADMIN_ROLES].some((r) => roles.has(r))
    : null;

  useEffect(() => {
    if (mounted && authorized === false && roles) {
      router.replace(findCorrectDashboard(roles));
    }
  }, [mounted, authorized, roles, router]);

  // During SSR and the first synchronous client render: always "authorized"
  // so the HTML tree matches and React hydrates without a mismatch.
  if (!mounted) return "authorized";

  // After mount: apply the real role check.
  if (!user || authorized === null) return "loading";
  if (!authorized) return "redirecting";
  return "authorized";
}
