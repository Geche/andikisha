"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@andikisha/ui";
import { UserCircle, LogOut } from "lucide-react";
import { logout } from "@/lib/auth";

/**
 * Sidebar profile + sign-out, shared by the admin and employee shells so both mirror the
 * same pattern. Rendered as plain nav items (no avatar, no divider) to sit flush with the
 * rest of the rail. `profileHref` differs by shell (/admin/profile vs /my/profile).
 */
export function SidebarUserChip({ profileHref }: { profileHref: string }) {
  const pathname = usePathname();

  return (
    <>
      <Link
        href={profileHref}
        className={cn(
          "flex items-center gap-2.5 w-full h-9 px-2.5 rounded-lg text-[13.5px] font-medium transition-colors",
          pathname.startsWith(profileHref)
            ? "bg-neutral-100 text-near-black"
            : "text-neutral-700 hover:bg-neutral-100"
        )}
      >
        <UserCircle size={16} strokeWidth={2} className="text-neutral-500" />
        Profile
      </Link>
      <button
        onClick={() => void logout()}
        className={cn(
          "flex items-center gap-2.5 w-full h-9 px-2.5 rounded-lg text-[13.5px] font-medium transition-colors",
          "text-neutral-700 hover:bg-neutral-100 cursor-pointer group"
        )}
      >
        <LogOut size={16} strokeWidth={2} className="text-neutral-500 group-hover:text-error" />
        <span className="group-hover:text-error">Sign out</span>
      </button>
    </>
  );
}
