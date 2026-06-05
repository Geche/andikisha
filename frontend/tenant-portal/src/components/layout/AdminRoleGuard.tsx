"use client";

import { useRoleGuard } from "@/hooks/useRoleGuard";

export function AdminRoleGuard({ children }: { children: React.ReactNode }) {
  const authStatus = useRoleGuard("admin");
  // "loading": user role not yet fetched — render nothing (no flash of admin content)
  // "redirecting": wrong role — render nothing while redirect fires
  if (authStatus !== "authorized") return null;
  return <>{children}</>;
}
