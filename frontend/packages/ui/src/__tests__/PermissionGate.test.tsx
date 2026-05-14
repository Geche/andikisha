import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CurrentUserContext } from "../lib/useCurrentUser";
import { PermissionGate } from "../components/PermissionGate";
import type { CurrentUser } from "../lib/useCurrentUser";

function withUser(user: CurrentUser | null, ui: React.ReactNode) {
  return (
    <CurrentUserContext.Provider value={user}>
      {ui}
    </CurrentUserContext.Provider>
  );
}

const adminUser: CurrentUser = {
  userId: "u1",
  tenantId: "t1",
  email: "admin@acme.co",
  roles: ["ADMIN"],
};

const multiRoleUser: CurrentUser = {
  userId: "u2",
  tenantId: "t1",
  email: "multi@acme.co",
  roles: ["EMPLOYEE", "LINE_MANAGER"],
};

describe("PermissionGate", () => {
  it("renders children when user has the required role (anyOf)", () => {
    render(
      withUser(
        adminUser,
        <PermissionGate anyOf={["ADMIN", "HR_MANAGER"]}>
          <span>visible</span>
        </PermissionGate>
      )
    );
    expect(screen.getByText("visible")).toBeInTheDocument();
  });

  it("hides children when user lacks all required roles (anyOf)", () => {
    render(
      withUser(
        adminUser,
        <PermissionGate anyOf={["HR_MANAGER", "PAYROLL_OFFICER"]}>
          <span>hidden</span>
        </PermissionGate>
      )
    );
    expect(screen.queryByText("hidden")).not.toBeInTheDocument();
  });

  it("renders fallback when user lacks required role", () => {
    render(
      withUser(
        adminUser,
        <PermissionGate anyOf={["EMPLOYEE"]} fallback={<span>fallback</span>}>
          <span>hidden</span>
        </PermissionGate>
      )
    );
    expect(screen.getByText("fallback")).toBeInTheDocument();
    expect(screen.queryByText("hidden")).not.toBeInTheDocument();
  });

  it("renders children for multi-role user matching anyOf", () => {
    render(
      withUser(
        multiRoleUser,
        <PermissionGate anyOf={["LINE_MANAGER", "ADMIN"]}>
          <span>visible</span>
        </PermissionGate>
      )
    );
    expect(screen.getByText("visible")).toBeInTheDocument();
  });

  it("hides children when user is null (unauthenticated)", () => {
    render(
      withUser(
        null,
        <PermissionGate anyOf={["ADMIN"]}>
          <span>hidden</span>
        </PermissionGate>
      )
    );
    expect(screen.queryByText("hidden")).not.toBeInTheDocument();
  });

  it("requires all roles when using allow (AND logic)", () => {
    const bothUser: CurrentUser = {
      userId: "u3",
      tenantId: "t1",
      email: "both@acme.co",
      roles: ["ADMIN", "HR_MANAGER"],
    };
    render(
      withUser(
        bothUser,
        <PermissionGate allow={["ADMIN", "HR_MANAGER"]}>
          <span>visible</span>
        </PermissionGate>
      )
    );
    expect(screen.getByText("visible")).toBeInTheDocument();
  });

  it("hides with allow when user is missing one required role", () => {
    render(
      withUser(
        adminUser,
        <PermissionGate allow={["ADMIN", "HR_MANAGER"]}>
          <span>hidden</span>
        </PermissionGate>
      )
    );
    expect(screen.queryByText("hidden")).not.toBeInTheDocument();
  });
});
