import { describe, it, expect, vi, afterEach } from "vitest";
import { findCorrectDashboard, ADMIN_ROLES, EMPLOYEE_ROLES } from "../lib/auth";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("findCorrectDashboard", () => {
  it("returns platform portal URL for SUPER_ADMIN when env var is set", () => {
    vi.stubEnv("NEXT_PUBLIC_PLATFORM_PORTAL_URL", "http://localhost:3003");
    expect(findCorrectDashboard(new Set(["SUPER_ADMIN"]))).toBe("http://localhost:3003");
  });

  it("returns /access-denied for SUPER_ADMIN when env var is not set", () => {
    // No stub — env var is absent in test environment; afterEach restores any stubs from prior tests
    expect(findCorrectDashboard(new Set(["SUPER_ADMIN"]))).toBe("/access-denied");
  });

  it("returns /admin/dashboard for ADMIN", () => {
    expect(findCorrectDashboard(new Set(["ADMIN"]))).toBe("/admin/dashboard");
  });

  it("returns /admin/dashboard for HR_MANAGER", () => {
    expect(findCorrectDashboard(new Set(["HR_MANAGER"]))).toBe("/admin/dashboard");
  });

  it("returns /admin/dashboard for PAYROLL_OFFICER", () => {
    expect(findCorrectDashboard(new Set(["PAYROLL_OFFICER"]))).toBe("/admin/dashboard");
  });

  it("returns /admin/dashboard for HR_OFFICER", () => {
    expect(findCorrectDashboard(new Set(["HR_OFFICER"]))).toBe("/admin/dashboard");
  });

  it("returns /my/dashboard for EMPLOYEE", () => {
    expect(findCorrectDashboard(new Set(["EMPLOYEE"]))).toBe("/my/dashboard");
  });

  it("returns /my/dashboard for LINE_MANAGER+EMPLOYEE (LINE_MANAGER routes through /my/*)", () => {
    expect(findCorrectDashboard(new Set(["EMPLOYEE", "LINE_MANAGER"]))).toBe("/my/dashboard");
  });

  it("returns /my/dashboard for LINE_MANAGER alone (single-role JWT — the production case)", () => {
    // Regression: JWTs carry a single `role`, so an operational LINE_MANAGER's role
    // set is {"LINE_MANAGER"} with no EMPLOYEE. Before the fix this fell through to
    // /access-denied, so the user landed on a 404 after a successful login.
    expect(findCorrectDashboard(new Set(["LINE_MANAGER"]))).toBe("/my/dashboard");
  });

  it("returns /access-denied for JWT with empty roles array (no recognised roles)", () => {
    expect(findCorrectDashboard(new Set<string>([]))).toBe("/access-denied");
  });

  it("returns /admin/dashboard for multi-role HR_MANAGER+EMPLOYEE (admin check runs first)", () => {
    expect(findCorrectDashboard(new Set(["HR_MANAGER", "EMPLOYEE"]))).toBe("/admin/dashboard");
  });

  it("ADMIN_ROLES contains exactly the four admin roles", () => {
    expect([...ADMIN_ROLES].sort()).toEqual(["ADMIN", "HR_MANAGER", "HR_OFFICER", "PAYROLL_OFFICER"].sort());
  });

  it("EMPLOYEE_ROLES contains only EMPLOYEE", () => {
    expect([...EMPLOYEE_ROLES]).toEqual(["EMPLOYEE"]);
  });
});
