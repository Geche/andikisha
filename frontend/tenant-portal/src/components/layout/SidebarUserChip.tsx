"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Avatar, cn, useCurrentUser } from "@andikisha/ui";
import { LogOut } from "lucide-react";
import { logout } from "@/lib/auth";

/**
 * Sidebar user chip — shared by the admin and employee shells so both mirror the same
 * pattern: avatar (identifies who's logged in) + "Profile" label linking to the role-correct
 * profile route, with Sign out below. `profileHref` differs by shell
 * (/admin/profile vs /my/profile).
 */
export function SidebarUserChip({ profileHref }: { profileHref: string }) {
  const pathname = usePathname();
  const currentUser = useCurrentUser();
  // Avatar initials still come from the user's name/email so the chip identifies them.
  const name = currentUser?.fullName?.trim() || currentUser?.email || "Account";

  return (
    <div className="space-y-0.5">
      <Link
        href={profileHref}
        aria-label="Profile"
        className={cn(
          "flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg transition-colors",
          pathname.startsWith(profileHref) ? "bg-neutral-100" : "hover:bg-neutral-100"
        )}
      >
        <Avatar name={name} size="sm" />
        <span className="text-[13px] font-semibold text-near-black">Profile</span>
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
    </div>
  );
}
