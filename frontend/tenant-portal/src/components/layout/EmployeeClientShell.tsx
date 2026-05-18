"use client";

import { useRouter } from "next/navigation";
import { EmployeeShell, ProfileMenu } from "@andikisha/ui";
import { useBottomNavItems, EmployeeDesktopNav } from "./EmployeeNav";
import { useRoleGuard } from "@/hooks/useRoleGuard";

interface EmployeeClientShellProps {
  userEmail: string;
  children: React.ReactNode;
}

export function EmployeeClientShell({ userEmail, children }: EmployeeClientShellProps) {
  const authStatus = useRoleGuard("employee");
  const bottomNav = useBottomNavItems();
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/login");
  }

  if (authStatus === "redirecting") return null;

  return (
    <EmployeeShell
      bottomNav={bottomNav}
      desktopNav={<EmployeeDesktopNav />}
      topRight={
        <ProfileMenu
          email={userEmail}
          role="EMPLOYEE"
          onLogout={() => void handleLogout()}
        />
      }
    >
      {children}
    </EmployeeShell>
  );
}
