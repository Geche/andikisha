"use client";

import { NavRailItem, NavRailGroup, type BottomNavItem } from "@andikisha/ui";
import { Home, FileText, Calendar, Clock, User } from "lucide-react";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@/hooks/useWorkspace";

export function useBottomNavItems(): BottomNavItem[] {
  const pathname = usePathname();
  const workspace = useWorkspace();
  const base = `/${workspace}`;

  const items = [
    { label: "Home",     href: `${base}/my/dashboard`, icon: Home },
    { label: "Payslips", href: `${base}/my/payslips`,  icon: FileText },
    { label: "Leave",    href: `${base}/my/leave`,     icon: Calendar },
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
  const base = `/${workspace}`;

  const items = [
    { label: "Home",       href: `${base}/my/dashboard`,  icon: Home },
    { label: "Payslips",   href: `${base}/my/payslips`,   icon: FileText },
    { label: "Leave",      href: `${base}/my/leave`,      icon: Calendar },
    { label: "Attendance", href: `${base}/my/attendance`, icon: Clock },
    { label: "Profile",    href: `${base}/my/profile`,    icon: User },
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
