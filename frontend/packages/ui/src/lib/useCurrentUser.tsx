"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import type { UserRole } from "./useCurrentRole";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CurrentUser {
  userId: string;
  tenantId: string;
  email: string;
  /**
   * Not yet populated — auth-service does not store user names.
   * Populated by the future user-profile feature (own schema migration + design prompt).
   * UI components should fall back to email or initials derived from the email local-part.
   */
  fullName?: string;
  /** Array because one user may hold multiple roles. Today always a singleton (single JWT role claim). */
  roles: UserRole[];
  employeeId?: string;
  // ── Fields populated in B1 / B2 — optional until then ──────────────────────
  /** Custom tenant-defined roles. Populated in B2. */
  customRoles?: string[];
  /** Fine-grained permissions. Populated in B2. */
  permissions?: string[];
  /** Department IDs the LINE_MANAGER user manages. Populated in B2. */
  managedDepartmentIds?: string[];
  /** Tenant subscription tier. Populated in B2. */
  tenantTier?: "STARTER" | "GROWTH" | "ENTERPRISE";
}

// ─── Context ──────────────────────────────────────────────────────────────────

export const CurrentUserContext = createContext<CurrentUser | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

/**
 * Hybrid SSR + React Query provider.
 *
 * 1. Renders immediately from `initialUser` (server-derived from x-user-* headers) — no flash.
 * 2. React Query fires a background GET /api/auth/me refetch on mount (~100ms, because
 *    initialDataUpdatedAt is set to 0 which marks SSR data as immediately stale).
 * 3. Context updates when the refetch resolves, correcting any staleness from
 *    the time the server rendered to when the client hydrated.
 *
 * IMPORTANT: This is SOFT UI gating only. The middleware enforces real role checks on
 * every request. Do not use role information from this hook to enforce security boundaries.
 *
 * IMPORTANT: This component uses useQuery and MUST be rendered inside a QueryClientProvider
 * (i.e., inside <QueryProvider> in the root layout).
 */
export function CurrentUserProvider({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser?: CurrentUser | null;
}) {
  const [user, setUser] = useState<CurrentUser | null>(initialUser ?? null);

  const { data: queryUser } = useQuery<CurrentUser | null>({
    queryKey: ["current-user"],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      if (!res.ok) return null;
      return res.json() as Promise<CurrentUser>;
    },
    initialData: initialUser ?? undefined,
    initialDataUpdatedAt: 0,
    staleTime: 60_000,
    refetchOnWindowFocus: true,
  });

  // Sync React Query result into context whenever it changes
  useEffect(() => {
    if (queryUser !== undefined) {
      setUser(queryUser ?? null);
    }
  }, [queryUser]);

  return (
    <CurrentUserContext.Provider value={user}>
      {children}
    </CurrentUserContext.Provider>
  );
}

// ─── Hooks ────────────────────────────────────────────────────────────────────

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
