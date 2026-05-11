"use client";

import Link from "next/link";
import { SidebarShell, type NavSection } from "@andikisha/ui";
import {
  Home,
  FileText,
  Calendar,
  Clock,
  User,
  Settings,
  UserCircle,
} from "lucide-react";
import { LogoutButton } from "./LogoutButton";

const NAV: NavSection[] = [
  {
    items: [{ label: "Home", href: "/dashboard", icon: Home }],
  },
  {
    label: "My Payroll",
    items: [{ label: "Payslips", href: "/dashboard/payslips", icon: FileText }],
  },
  {
    label: "My Time",
    items: [
      { label: "Leave", href: "/dashboard/leave", icon: Calendar },
      { label: "Attendance", href: "/dashboard/attendance", icon: Clock },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile", href: "/dashboard/profile", icon: User },
      { label: "Documents", href: "/dashboard/documents", icon: FileText, locked: true },
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
            href="/dashboard/profile"
            className="flex items-center gap-2.5 w-full h-[38px] px-2.5 rounded-md text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <UserCircle size={16} strokeWidth={2} className="text-gray-400" />
            My profile
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2.5 w-full h-[38px] px-2.5 rounded-md text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Settings size={16} strokeWidth={2} className="text-gray-400" />
            Settings
          </Link>
          <LogoutButton />
        </>
      }
    />
  );
}
