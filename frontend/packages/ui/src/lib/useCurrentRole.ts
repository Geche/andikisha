"use client";
import { createContext, useContext } from "react";

export type UserRole =
  | "SUPER_ADMIN"
  | "ADMIN"
  | "HR_MANAGER"
  | "PAYROLL_OFFICER"
  | "HR"
  | "LINE_MANAGER"
  | "EMPLOYEE"
  | null;

export const RoleContext = createContext<UserRole>(null);

export function useCurrentRole(): UserRole {
  return useContext(RoleContext);
}
