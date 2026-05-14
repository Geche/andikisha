"use client";
import type { ReactNode } from "react";
import type { UserRole } from "../lib/useCurrentRole";
import { useCurrentUser } from "../lib/useCurrentUser";

interface PermissionGateProps {
  /**
   * Render children if the user holds ALL of these roles.
   * For "at least one of", use anyOf instead.
   */
  allow?: NonNullable<UserRole>[];
  /**
   * Render children if the user holds AT LEAST ONE of these roles.
   * Use this for role-OR checks (most common case).
   */
  anyOf?: NonNullable<UserRole>[];
  fallback?: ReactNode;
  children: ReactNode;
}

/**
 * Conditionally renders children based on the current user's role set.
 * SOFT UI GATING ONLY — the backend enforces real authorization on every request.
 *
 * @example
 * <PermissionGate anyOf={["ADMIN", "PAYROLL_OFFICER"]}>
 *   <RunPayrollButton />
 * </PermissionGate>
 */
export function PermissionGate({
  allow,
  anyOf,
  fallback = null,
  children,
}: PermissionGateProps) {
  const user = useCurrentUser();
  if (!user || user.roles.length === 0) return <>{fallback}</>;

  const roles = user.roles as NonNullable<UserRole>[];
  const permitted = anyOf
    ? anyOf.some((r) => roles.includes(r))
    : allow
    ? allow.every((r) => roles.includes(r))
    : false;

  return permitted ? <>{children}</> : <>{fallback}</>;
}
