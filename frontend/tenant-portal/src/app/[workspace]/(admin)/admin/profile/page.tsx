import { ProfileView } from "@/components/ProfileView";

// Admin-shell profile. Same content as /my/profile, rendered inside the admin shell so
// admin-tier users keep their navigation context (Workspace, Access) instead of being
// dropped into the employee portal. The (admin) layout's AdminRoleGuard ensures only
// admin roles reach here. Graceful no-employee handling lives in ProfileView (R3-2c).
export default function AdminProfilePage() {
  return <ProfileView />;
}
