/**
 * EDGE RUNTIME SAFE — this file must remain pure:
 * - No React imports, hooks, or JSX
 * - No Node.js built-ins (fs, crypto, etc.)
 * - No dynamic requires
 * Next.js middleware runs in the Edge runtime. This file is imported via the
 * './auth' subpath export to avoid bundling the barrel (which includes React).
 */

export const ADMIN_ROLES: ReadonlySet<string> = new Set(["ADMIN", "HR_MANAGER", "HR_OFFICER", "PAYROLL_OFFICER"]);
export const EMPLOYEE_ROLES: ReadonlySet<string> = new Set(["EMPLOYEE"]);

/**
 * Returns the canonical dashboard URL for the given user's role set.
 * Used by middleware (redirect on mismatch), login page (post-login navigate),
 * and any "go home" link in the UI.
 *
 * SUPER_ADMIN redirects to the platform portal (cross-origin).
 * Returns '/access-denied' when no env var is set and the user is SUPER_ADMIN,
 * or when the role set has no recognised roles.
 */
export function findCorrectDashboard(roles: Set<string>): string {
  if (roles.has("SUPER_ADMIN")) {
    return process.env.NEXT_PUBLIC_PLATFORM_PORTAL_URL ?? "/access-denied";
  }
  for (const r of ADMIN_ROLES) {
    if (roles.has(r)) return "/admin/dashboard";
  }
  // Operational, non-admin roles live under /my/*. LINE_MANAGER carries a single
  // role claim with no EMPLOYEE, so it must be matched explicitly — otherwise a
  // successful login falls through to /access-denied (a 404 at /{workspace}/...).
  // Per frontend CLAUDE.md, LINE_MANAGER routes through /my/* only; its team
  // surface is a conditional section inside /my/*.
  if (roles.has("EMPLOYEE") || roles.has("LINE_MANAGER")) return "/my/dashboard";
  return "/access-denied";
}
