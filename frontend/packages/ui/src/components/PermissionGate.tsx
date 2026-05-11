"use client";
import type { ReactNode } from "react";
import { useCurrentRole, type UserRole } from "../lib/useCurrentRole";

interface PermissionGateProps {
  allow: NonNullable<UserRole>[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function PermissionGate({ allow, fallback = null, children }: PermissionGateProps) {
  const role = useCurrentRole();
  if (!role || !allow.includes(role)) return <>{fallback}</>;
  return <>{children}</>;
}
