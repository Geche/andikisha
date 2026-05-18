"use client";

import { useRoleGuard } from "@/hooks/useRoleGuard";

export function AdminRoleGuard({ children }: { children: React.ReactNode }) {
  const authStatus = useRoleGuard("admin");
  if (authStatus !== "authorized") return null;
  return <>{children}</>;
}
