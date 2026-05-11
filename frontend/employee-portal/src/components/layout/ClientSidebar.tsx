"use client";

import { EmployeeShell } from "@andikisha/ui";
import { useBottomNavItems, EmployeeDesktopNav, EmployeeDesktopNavFooter } from "./Sidebar";

interface ClientShellProps {
  userEmail: string;
  children: React.ReactNode;
}

export function ClientShell({ userEmail, children }: ClientShellProps) {
  const bottomNav = useBottomNavItems();
  return (
    <EmployeeShell
      bottomNav={bottomNav}
      desktopNav={<EmployeeDesktopNav />}
      desktopNavFooter={<EmployeeDesktopNavFooter />}
      topRight={
        <span className="text-[12px] text-[#6B7280] truncate max-w-[160px]">{userEmail}</span>
      }
    >
      {children}
    </EmployeeShell>
  );
}
