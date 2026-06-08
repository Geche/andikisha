"use client";
import { LogOut, User, Settings } from "lucide-react";
import { DropdownRoot, DropdownTrigger, DropdownContent, DropdownItem, DropdownSeparator } from "./Dropdown";
import { Avatar } from "./Avatar";
import { RoleBadge } from "./RoleBadge";
import type { UserRole } from "../lib/useCurrentRole";

interface ProfileMenuProps {
  email: string;
  name?: string;
  role?: UserRole;
  onLogout: () => void;
  onProfile?: () => void;
  onSettings?: () => void;
}

export function ProfileMenu({ email, name, role, onLogout, onProfile, onSettings }: ProfileMenuProps) {
  return (
    <DropdownRoot>
      <DropdownTrigger asChild>
        <button
          className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-neutral-100 transition-colors focus-visible:outline-none focus-visible:shadow-focus"
          aria-label="Open profile menu"
        >
          <Avatar name={name ?? email} size="sm" />
        </button>
      </DropdownTrigger>
      <DropdownContent align="end">
        <div className="px-3 py-2">
          <p className="text-[13px] font-semibold text-near-black truncate">{name ?? email}</p>
          <p className="text-[11.5px] text-neutral-500 truncate">{email}</p>
          {role && <div className="mt-1.5"><RoleBadge role={role} /></div>}
        </div>
        <DropdownSeparator />
        {onProfile && (
          <DropdownItem onSelect={onProfile}>
            <User size={14} /> Profile
          </DropdownItem>
        )}
        {onSettings && (
          <DropdownItem onSelect={onSettings}>
            <Settings size={14} /> Settings
          </DropdownItem>
        )}
        <DropdownSeparator />
        <DropdownItem onSelect={onLogout} danger>
          <LogOut size={14} /> Sign out
        </DropdownItem>
      </DropdownContent>
    </DropdownRoot>
  );
}
