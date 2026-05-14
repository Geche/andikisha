"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import type { UserRole } from "./useCurrentRole";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CurrentUser {
  userId: string;
  tenantId: string;
  email: string;
  fullName?: string;
  /** Array because one user may hold multiple roles (e.g. EMPLOYEE + LINE_MANAGER). */
  roles: UserRole[];
  employeeId?: string;
  managedDepartmentIds?: string[];
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const CurrentUserContext = createContext<CurrentUser | null>(null);

// ─── JWT decode (payload only — verification is the server's job) ─────────────

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return null;
    const padded = parts[1] + "=".repeat((4 - (parts[1].length % 4)) % 4);
    const json = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function readCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1")}=([^;]*)`)
  );
  return match ? decodeURIComponent(match[1] ?? "") : undefined;
}

const VALID_ROLES = new Set<UserRole>([
  "SUPER_ADMIN", "ADMIN", "HR_MANAGER", "PAYROLL_OFFICER",
  "HR", "LINE_MANAGER", "EMPLOYEE",
]);

function isValidRole(r: unknown): r is UserRole {
  return typeof r === "string" && VALID_ROLES.has(r as UserRole);
}

function resolveUser(token: string): CurrentUser | null {
  const payload = decodeJwtPayload(token);
  if (!payload) return null;

  // Support both current (single `role`) and future Prompt-B (`roles` array) JWT shapes
  const rawRoles: unknown[] = Array.isArray(payload.roles)
    ? payload.roles
    : payload.role != null
    ? [payload.role]
    : [];

  const roles = rawRoles.filter(isValidRole) as UserRole[];
  if (roles.length === 0) return null;

  return {
    userId: String(payload.sub ?? ""),
    tenantId: String(payload.tenantId ?? ""),
    email: String(payload.email ?? ""),
    fullName: typeof payload.fullName === "string" ? payload.fullName : undefined,
    roles,
    employeeId: typeof payload.employeeId === "string" ? payload.employeeId : undefined,
    managedDepartmentIds: Array.isArray(payload.managedDepartmentIds)
      ? (payload.managedDepartmentIds as unknown[]).filter((d): d is string => typeof d === "string")
      : undefined,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * Reads the tenant_token JWT from the cookie, decodes the payload client-side,
 * and makes the current user available throughout the tree.
 *
 * IMPORTANT: This is SOFT UI gating only. The JWT payload is decoded without
 * signature verification (verification happens on the server for every request).
 * Do not use role information from this hook to enforce security boundaries.
 *
 * TODO(prompt-b): Replace cookie decode with GET /api/v1/auth/me when that
 * endpoint exists. The hook signature and CurrentUser shape stay the same.
 */
export function CurrentUserProvider({
  children,
  cookieName = "tenant_token",
}: {
  children: ReactNode;
  cookieName?: string;
}) {
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const token = readCookie(cookieName);
    setUser(token ? resolveUser(token) : null);
  }, [cookieName]);

  return (
    <CurrentUserContext.Provider value={user}>
      {children}
    </CurrentUserContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/** Returns the decoded current user, or null if unauthenticated. */
export function useCurrentUser(): CurrentUser | null {
  return useContext(CurrentUserContext);
}

/** Returns true if the user holds the given role. */
export function useHasRole(role: UserRole): boolean {
  const user = useCurrentUser();
  return user?.roles.includes(role) ?? false;
}

/** Returns true if the user holds at least one of the given roles. */
export function useHasAnyRole(...roles: UserRole[]): boolean {
  const user = useCurrentUser();
  if (!user) return false;
  return roles.some((r) => user.roles.includes(r));
}

/** Returns true if there is an authenticated user in context. */
export function useIsAuthenticated(): boolean {
  return useCurrentUser() !== null;
}
