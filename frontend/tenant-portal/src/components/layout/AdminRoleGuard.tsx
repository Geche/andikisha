"use client";

import { useRoleGuard } from "@/hooks/useRoleGuard";

export function AdminRoleGuard({ children }: { children: React.ReactNode }) {
  useRoleGuard("admin");
  return <>{children}</>;
}
