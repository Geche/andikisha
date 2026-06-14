"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@andikisha/ui";
import { ADMIN_ROLES } from "@andikisha/ui/auth";
import { useWorkspace } from "@/hooks/useWorkspace";
import { ProfileView } from "@/components/ProfileView";

// Employee-shell profile. Admin-role users belong on /admin/profile (admin shell) — if one
// lands here by direct URL, redirect rather than trap them in the employee-portal shell.
export default function MyProfilePage() {
  const user = useCurrentUser();
  const router = useRouter();
  const workspace = useWorkspace();
  const isAdmin = (user?.roles ?? []).some((r) => !!r && ADMIN_ROLES.has(r));

  useEffect(() => {
    if (isAdmin) router.replace(`/${workspace}/admin/profile`);
  }, [isAdmin, workspace, router]);

  if (isAdmin) return null; // redirecting to the admin-shell profile
  return <ProfileView />;
}
