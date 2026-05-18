"use client";

import { useRoleGuard } from "@/hooks/useRoleGuard";

export function AdminRoleGuard({ children }: { children: React.ReactNode }) {
  const authStatus = useRoleGuard("admin");
  if (authStatus === "redirecting") return null;
  return <>{children}</>;
}
