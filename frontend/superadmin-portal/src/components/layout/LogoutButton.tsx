"use client";

import { LogOut } from "lucide-react";
import { logout } from "@/lib/auth";

export function LogoutButton() {
  return (
    <button
      onClick={() => logout()}
      className="flex items-center gap-2.5 w-full h-[36px] px-2.5 rounded-md text-[13.5px] text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors group"
    >
      <LogOut size={16} strokeWidth={2} className="text-gray-400 group-hover:text-red-500" />
      Log out
    </button>
  );
}
