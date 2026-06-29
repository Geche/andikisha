"use client";

import { NavRailItem, NavRailGroup, useHasRole, type BottomNavItem } from "@andikisha/ui";
import { Home, FileText, Calendar, Clock, User, ClipboardCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@/hooks/useWorkspace";

export function useBottomNavItems(): BottomNavItem[] {
  const pathname = usePathname();
  const workspace = useWorkspace();
  const isLineManager = useHasRole("LINE_MANAGER");
  const base = `/${workspace}`;

  const items = [
    { label: "Home",     href: `${base}/my/dashboard`, icon: Home },
    { label: "Payslips", href: `${base}/my/payslips`,  icon: FileText },
    { label: "Leave",    href: `${base}/my/leave`,     icon: Calendar },
    // Team approvals is the LINE_MANAGER's primary task surface — only role that sees it.
    ...(isLineManager
      ? [{ label: "Team", href: `${base}/my/team-approvals`, icon: ClipboardCheck }]
      : []),
    { label: "Profile",  href: `${base}/my/profile`,   icon: User },
  ];

  return items.map((item) => ({
    ...item,
    active: pathname.startsWith(item.href),
  }));
}

export function EmployeeDesktopNav() {
  const pathname = usePathname();
  const workspace = useWorkspace();
  const isLineManager = useHasRole("LINE_MANAGER");
  const base = `/${workspace}`;

  // Profile is reached via the chip at the bottom of the rail (desktopNavFooter), so it is
  // intentionally not repeated here. The mobile bottom nav keeps its Profile tab.
  const items = [
    { label: "Home",       href: `${base}/my/dashboard`,  icon: Home },
    { label: "Payslips",   href: `${base}/my/payslips`,   icon: FileText },
    { label: "Leave",      href: `${base}/my/leave`,      icon: Calendar },
    { label: "Attendance", href: `${base}/my/attendance`, icon: Clock },
    // Shown only when the LINE_MANAGER role is present in the JWT claims.
    ...(isLineManager
      ? [{ label: "Team approvals", href: `${base}/my/team-approvals`, icon: ClipboardCheck }]
      : []),
  ];

  return (
    <NavRailGroup theme="light">
      {items.map((item) => (
        <NavRailItem
          key={item.label}
          {...item}
          theme="light"
          active={pathname.startsWith(item.href)}
        />
      ))}
    </NavRailGroup>
  );
}
