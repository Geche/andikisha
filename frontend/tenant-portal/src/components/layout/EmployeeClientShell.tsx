"use client";

import { useRouter } from "next/navigation";
import { EmployeeShell, ProfileMenu } from "@andikisha/ui";
import { useBottomNavItems, EmployeeDesktopNav } from "./EmployeeNav";
import { SidebarUserChip } from "./SidebarUserChip";
import { useRoleGuard } from "@/hooks/useRoleGuard";
import { useWorkspace } from "@/hooks/useWorkspace";

interface EmployeeClientShellProps {
  userEmail: string;
  children: React.ReactNode;
}

export function EmployeeClientShell({ userEmail, children }: EmployeeClientShellProps) {
  const authStatus = useRoleGuard("employee");
  const bottomNav = useBottomNavItems();
  const router = useRouter();
  const workspace = useWorkspace();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace(workspace ? `/${workspace}/login` : "/login");
  }

  // "loading": user role not yet fetched — render nothing (no flash of employee content)
  // "redirecting": wrong role — render nothing while redirect fires
  if (authStatus !== "authorized") return null;

  return (
    <EmployeeShell
      bottomNav={bottomNav}
      desktopNav={<EmployeeDesktopNav />}
      // Desktop: chip-at-bottom (avatar + "Profile" + Sign out), mirroring the admin shell.
      desktopNavFooter={<SidebarUserChip profileHref={`/${workspace}/my/profile`} />}
      // Mobile only: the desktop chip lives in the left rail (hidden on mobile), so keep the
      // profile menu in the top bar for phones.
      topRight={
        <div className="lg:hidden">
          <ProfileMenu
            email={userEmail}
            role="EMPLOYEE"
            onLogout={() => void handleLogout()}
            onProfile={() => router.push(workspace ? `/${workspace}/my/profile` : "/my/profile")}
          />
        </div>
      }
    >
      {children}
    </EmployeeShell>
  );
}
