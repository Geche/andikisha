"use client";

import Link from "next/link";
import { SidebarShell, type NavSection } from "@andikisha/ui";
import {
  Home,
  FileText,
  Calendar,
  Clock,
  User,
  UserCircle,
} from "lucide-react";
import { LogoutButton } from "./LogoutButton";

const NAV: NavSection[] = [
  {
    items: [
      { label: "Home",        href: "/dashboard",  icon: Home },
      { label: "Payslips",    href: "/payslips",   icon: FileText },
      { label: "Leave",       href: "/leave",      icon: Calendar },
      { label: "Attendance",  href: "/attendance", icon: Clock },
      { label: "Profile",     href: "/profile",    icon: User },
    ],
  },
];

export function Sidebar({
  activePath,
  userEmail,
}: {
  activePath: string;
  userEmail: string;
}) {
  return (
    <SidebarShell
      nav={NAV}
      activePath={activePath}
      userEmail={userEmail}
      userRole="Employee"
      footerContent={
        <>
          <Link
            href="/profile"
            className="flex items-center gap-2.5 w-full h-[36px] px-2.5 rounded-md text-[13.5px] text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <UserCircle size={16} strokeWidth={2} className="text-gray-400" />
            My profile
          </Link>
          <LogoutButton />
        </>
      }
    />
  );
}
