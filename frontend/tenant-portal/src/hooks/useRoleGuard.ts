"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useCurrentUser } from "@andikisha/ui";
import { ADMIN_ROLES, findCorrectDashboard } from "@andikisha/ui/auth";

type AuthStatus = "authorized" | "redirecting";

function checkAuthorized(roles: Set<string>, area: "employee" | "admin"): boolean {
  return area === "employee"
    ? roles.has("EMPLOYEE")
    : [...ADMIN_ROLES].some((r) => roles.has(r));
}

export function useRoleGuard(area: "employee" | "admin"): AuthStatus {
  const user = useCurrentUser();
  const router = useRouter();
  const params = useParams();
  const workspace = typeof params.workspace === "string" ? params.workspace : "";

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

  if (authorized === false) return "redirecting";
  return "authorized";
}
