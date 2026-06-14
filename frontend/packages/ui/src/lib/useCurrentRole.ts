"use client";
import { createContext } from "react";
import { useCurrentUser } from "./useCurrentUser";

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "HR_MANAGER"
  | "HR_OFFICER"
  | "PAYROLL_OFFICER"
  | "LINE_MANAGER"
  | "EMPLOYEE"
  | null;

/**
 * @deprecated Replaced by CurrentUserContext from useCurrentUser.tsx.
 * Kept for backward compatibility only.
 */
export const RoleContext = createContext<UserRole>(null);

/**
 * Returns the first role from the current user's role set, or null.
 * For multi-role support (Prompt B), use useCurrentUser().roles instead.
 */
export function useCurrentRole(): UserRole {
  const user = useCurrentUser();
  return user?.roles[0] ?? null;
}
