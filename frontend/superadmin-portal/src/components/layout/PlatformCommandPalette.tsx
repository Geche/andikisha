"use client";
import { useRouter } from "next/navigation";
import { CommandPalette } from "@andikisha/ui";
import { Building2, LayoutDashboard, FileSearch, Flag } from "lucide-react";

export function PlatformCommandPalette() {
  const router = useRouter();
  return (
    <CommandPalette
      placeholder="Search platform actions, tenants, pages…"
      groups={[
        {
          label: "Navigation",
          items: [
            {
              id: "nav-dashboard",
              label: "Dashboard",
              icon: LayoutDashboard,
              onSelect: () => router.push("/dashboard"),
              keywords: ["home"],
            },
            {
              id: "nav-tenants",
              label: "Tenants",
              icon: Building2,
              onSelect: () => router.push("/tenants"),
              keywords: ["customers"],
            },
            {
              id: "nav-audit",
              label: "Audit Log",
              icon: FileSearch,
              onSelect: () => router.push("/audit"),
              keywords: ["logs", "audit"],
            },
            {
              id: "nav-flags",
              label: "Feature Flags",
              icon: Flag,
              onSelect: () => router.push("/feature-flags"),
              keywords: ["flags", "features"],
            },
          ],
        },
        {
          label: "Actions",
          items: [
            {
              id: "action-new-tenant",
              label: "Create new tenant",
              icon: Building2,
              onSelect: () => router.push("/tenants/new"),
              keywords: ["new", "create", "tenant"],
            },
          ],
        },
      ]}
    />
  );
}
