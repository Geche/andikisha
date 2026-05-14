import { redirect } from "next/navigation";

// TODO(prompt-b): replace with role-aware redirect.
// SUPER_ADMIN routes to platform-portal (separate app).
// Any admin-side role (ADMIN, HR_MANAGER, PAYROLL_OFFICER, HR) lands at /admin/dashboard.
// Otherwise (EMPLOYEE, LINE_MANAGER) lands at /my/dashboard.
export default function Home() {
  redirect("/my/dashboard");
}
