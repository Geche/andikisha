"use client";

import { NavRailItem, NavRailGroup, cn, type BottomNavItem } from "@andikisha/ui";
import { Home, FileText, Calendar, Clock, User, LogOut } from "lucide-react";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/auth";

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

export function EmployeeDesktopNavFooter() {
  return (
    <button
      onClick={() => void logout()}
      className={cn(
        "flex items-center gap-2.5 w-full h-9 px-2.5 rounded-lg text-[13.5px] font-medium transition-colors",
        "text-[#374151] hover:bg-[#F3F4F6] cursor-pointer group"
      )}
    >
      <LogOut size={16} strokeWidth={2} className="text-[#6B7280] group-hover:text-error" />
      <span className="group-hover:text-error">Sign out</span>
    </button>
  );
}
