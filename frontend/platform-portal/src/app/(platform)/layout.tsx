"use client";

import { useRouter } from "next/navigation";
import { HorizontalShell, ProfileMenu, useCurrentUser } from "@andikisha/ui";
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

  return (
    <HorizontalShell navItems={platformNavConfig} rightSlot={rightSlot}>
      {children}
    </HorizontalShell>
  );
}
