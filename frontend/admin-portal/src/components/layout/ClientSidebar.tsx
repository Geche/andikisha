"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";

export function ClientSidebar({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  return <Sidebar activePath={pathname} userEmail={userEmail} />;
}
