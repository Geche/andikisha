"use client";

import { useRouter } from "next/navigation";
import { HorizontalShell, ProfileMenu, useCurrentUser, IdleWarningBanner } from "@andikisha/ui";
import { platformNavConfig } from "@/lib/navConfig";

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  const user = useCurrentUser();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  const rightSlot = user ? (
    <ProfileMenu
      email={user.email}
      role="SUPER_ADMIN"
      onLogout={handleLogout}
    />
  ) : null;

  const devTimeout = typeof process !== "undefined" && process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MS
    ? parseInt(process.env.NEXT_PUBLIC_IDLE_TIMEOUT_MS, 10)
    : undefined;

  return (
    <HorizontalShell navItems={platformNavConfig} rightSlot={rightSlot}>
      {children}
      <IdleWarningBanner
        thresholdMs={60 * 60 * 1000}
        warningMs={2 * 60 * 1000}
        cookieName="platform_token"
        returnToAllowedPrefixes={["/"]}
        logoutPath="/api/auth/logout"
        devThresholdMs={devTimeout}
      />
    </HorizontalShell>
  );
}
