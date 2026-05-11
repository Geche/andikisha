"use client";

import Link from "next/link";
import { SidebarShell, type NavSection } from "@andikisha/ui";
import {
  Home,
  Users,
  CreditCard,
  Calendar,
  Clock,
  FileCheck,
  BarChart2,
  Settings,
  UserCircle,
} from "lucide-react";
import { LogoutButton } from "./LogoutButton";

const NAV: NavSection[] = [
  {
    items: [{ label: "Dashboard", href: "/dashboard", icon: Home }],
  },
  {
    label: "People",
    items: [{ label: "Employees", href: "/employees", icon: Users }],
  },
  {
    label: "Payroll",
    items: [{ label: "Payroll Runs", href: "/payroll", icon: CreditCard }],
  },
  {
    label: "HR",
    items: [
      { label: "Leave Management", href: "/leave", icon: Calendar },
      { label: "Time & Attendance", href: "/attendance", icon: Clock, locked: true },
    ],
  },
  {
    label: "Compliance",
    items: [
      { label: "Statutory Filings", href: "/compliance", icon: FileCheck, locked: true },
      { label: "Analytics", href: "/analytics", icon: BarChart2, locked: true },
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
      userRole="HR Admin"
      footerContent={
        <>
          <Link
            href="/settings/profile"
            className="flex items-center gap-2.5 w-full h-[38px] px-2.5 rounded-md text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <UserCircle size={16} strokeWidth={2} className="text-gray-400" />
            My profile
          </Link>
          <Link
            href="/settings"
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
