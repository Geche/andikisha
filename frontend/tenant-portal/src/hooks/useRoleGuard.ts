"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCurrentUser } from "@andikisha/ui";
import { ADMIN_ROLES, findCorrectDashboard } from "@andikisha/ui/auth";

type AuthStatus = "authorized" | "redirecting" | "loading";

function checkAuthorized(roles: Set<string>, area: "employee" | "admin"): boolean {
  // R3-1: /my/* (area "employee") is open to any authenticated user — the gate was
  // relaxed from EMPLOYEE-only so the admin "My profile" link works for standalone
  // admins. The /my/profile page degrades gracefully for users with no employee
  // record (R3-2c). Admin area remains role-gated.
  return area === "employee"
    ? true
    : [...ADMIN_ROLES].some((r) => roles.has(r));
}

export function useRoleGuard(area: "employee" | "admin"): AuthStatus {
  const user = useCurrentUser();
  const router = useRouter();
  const params = useParams();
  const workspace = typeof params.workspace === "string" ? params.workspace : "";

  // roles is null when the user is still loading — treat that as "loading", not "authorized"
  const roles = user
    ? new Set<string>(user.roles.flatMap((r) => (r ? [r] : [])))
    : null;

  const authorized = roles ? checkAuthorized(roles, area) : null;

  useEffect(() => {
    if (authorized === false && roles) {
      const target = `/${workspace}${findCorrectDashboard(roles)}`;
      router.replace(target);
    }
  }, [authorized, roles, router, workspace]);

  if (authorized === null) return "loading";   // user not yet fetched — default-deny
  if (authorized === false) return "redirecting";
  return "authorized";
}
