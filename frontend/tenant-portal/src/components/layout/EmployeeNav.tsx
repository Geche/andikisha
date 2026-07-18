"use client";

import { NavRailItem, NavRailGroup, useHasRole, type BottomNavItem } from "@andikisha/ui";
import { Home, FileText, Calendar, Clock, User, ClipboardCheck, ClipboardList, CalendarClock } from "lucide-react";
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
    // Team approvals + recruitment are LINE_MANAGER-only self-service surfaces.
    ...(isLineManager
      ? [
          { label: "Team",       href: `${base}/my/team-approvals`,          icon: ClipboardCheck },
          { label: "Hiring",     href: `${base}/my/recruitment/requisitions`, icon: ClipboardList },
          { label: "Interviews", href: `${base}/my/recruitment/interviews`,   icon: CalendarClock },
        ]
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
      ? [
          { label: "Team approvals", href: `${base}/my/team-approvals`,           icon: ClipboardCheck },
          { label: "Requisitions",   href: `${base}/my/recruitment/requisitions`, icon: ClipboardList },
          { label: "Interviews",     href: `${base}/my/recruitment/interviews`,   icon: CalendarClock },
        ]
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
