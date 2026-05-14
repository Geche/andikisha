import { describe, it, expect, beforeEach } from "vitest";
import { findCorrectDashboard, ADMIN_ROLES, EMPLOYEE_ROLES } from "../lib/auth";

// Store original env
const originalEnv = process.env;

beforeEach(() => {
  process.env = { ...originalEnv };
});

describe("findCorrectDashboard", () => {
  it("returns platform portal URL for SUPER_ADMIN when env var is set", () => {
    process.env.NEXT_PUBLIC_PLATFORM_PORTAL_URL = "http://localhost:3003";
    expect(findCorrectDashboard(new Set(["SUPER_ADMIN"]))).toBe("http://localhost:3003");
  });

  it("returns /access-denied for SUPER_ADMIN when env var is not set", () => {
    delete process.env.NEXT_PUBLIC_PLATFORM_PORTAL_URL;
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

  it("returns /admin/dashboard for HR", () => {
    expect(findCorrectDashboard(new Set(["HR"]))).toBe("/admin/dashboard");
  });

  it("returns /my/dashboard for EMPLOYEE", () => {
    expect(findCorrectDashboard(new Set(["EMPLOYEE"]))).toBe("/my/dashboard");
  });

  it("returns /my/dashboard for LINE_MANAGER+EMPLOYEE (LINE_MANAGER routes through /my/*)", () => {
    expect(findCorrectDashboard(new Set(["EMPLOYEE", "LINE_MANAGER"]))).toBe("/my/dashboard");
  });

  it("returns /access-denied for empty roles Set", () => {
    expect(findCorrectDashboard(new Set())).toBe("/access-denied");
  });

  it("returns /access-denied for JWT with empty roles array (no recognised roles)", () => {
    expect(findCorrectDashboard(new Set<string>([]))).toBe("/access-denied");
  });

  it("returns /admin/dashboard for multi-role HR_MANAGER+EMPLOYEE (admin check runs first)", () => {
    expect(findCorrectDashboard(new Set(["HR_MANAGER", "EMPLOYEE"]))).toBe("/admin/dashboard");
  });

  it("ADMIN_ROLES contains exactly the four admin roles", () => {
    expect([...ADMIN_ROLES].sort()).toEqual(["ADMIN", "HR", "HR_MANAGER", "PAYROLL_OFFICER"].sort());
  });

  it("EMPLOYEE_ROLES contains only EMPLOYEE", () => {
    expect([...EMPLOYEE_ROLES]).toEqual(["EMPLOYEE"]);
  });
});
