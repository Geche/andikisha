"use client";

import { NavRailItem, NavRailGroup, type BottomNavItem } from "@andikisha/ui";
import { Home, FileText, Calendar, Clock, User } from "lucide-react";
import { usePathname } from "next/navigation";

const BOTTOM_NAV_ITEMS = [
  { label: "Home",     href: "/my/dashboard", icon: Home },
  { label: "Payslips", href: "/my/payslips",  icon: FileText },
  { label: "Leave",    href: "/my/leave",     icon: Calendar },
  { label: "Profile",  href: "/my/profile",   icon: User },
];

export function useBottomNavItems(): BottomNavItem[] {
  const pathname = usePathname();
  return BOTTOM_NAV_ITEMS.map((item) => ({
    ...item,
    active: pathname.startsWith(item.href),
  }));
}

export function EmployeeDesktopNav() {
  const pathname = usePathname();
  const items = [
    { label: "Home",       href: "/my/dashboard", icon: Home },
    { label: "Payslips",   href: "/my/payslips",  icon: FileText },
    { label: "Leave",      href: "/my/leave",     icon: Calendar },
    { label: "Attendance", href: "/my/attendance", icon: Clock },
    { label: "Profile",    href: "/my/profile",   icon: User },
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

