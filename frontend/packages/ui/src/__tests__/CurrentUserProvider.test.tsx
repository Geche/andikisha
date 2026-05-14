import { describe, it, expect, vi, beforeEach, afterEach, type MockInstance } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CurrentUserProvider, useCurrentUser } from "../lib/useCurrentUser";
import type { CurrentUser } from "../lib/useCurrentUser";

// Minimal wrapper: QueryProvider must wrap CurrentUserProvider
function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

function CurrentUserDisplay() {
  const user = useCurrentUser();
  if (!user) return <span>no-user</span>;
  return <span>{user.email}:{user.roles.join(",")}</span>;
}

const INITIAL_USER: CurrentUser = {
  userId: "u1",
  tenantId: "t1",
  email: "hr@acme.co",
  roles: ["HR_MANAGER"],
};

const FRESH_USER: CurrentUser = {
  userId: "u1",
  tenantId: "t1",
  email: "hr@acme.co",
  roles: ["HR_MANAGER", "EMPLOYEE"],
  employeeId: "e1",
};

describe("CurrentUserProvider", () => {
  let fetchSpy: MockInstance<typeof globalThis.fetch>;
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    fetchSpy = vi.spyOn(globalThis, "fetch");
  });

  afterEach(() => {
    vi.restoreAllMocks();
    queryClient.clear();
  });

  it("hydrates immediately from initialUser — no flash, no fetch on first render", () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify(FRESH_USER), { status: 200 })
    );

    const Wrapper = makeWrapper(queryClient);
    render(
      <Wrapper>
        <CurrentUserProvider initialUser={INITIAL_USER}>
          <CurrentUserDisplay />
        </CurrentUserProvider>
      </Wrapper>
    );

    // Must be available on FIRST render without waiting
    expect(screen.getByText("hr@acme.co:HR_MANAGER")).toBeInTheDocument();
  });

  it("fires /api/auth/me refetch on mount (initialDataUpdatedAt: 0 effect)", async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify(FRESH_USER), { status: 200 })
    );

    const Wrapper = makeWrapper(queryClient);

    render(
      <Wrapper>
        <CurrentUserProvider initialUser={INITIAL_USER}>
          <CurrentUserDisplay />
        </CurrentUserProvider>
      </Wrapper>
    );

    await waitFor(() => expect(fetchSpy).toHaveBeenCalledWith("/api/auth/me"));
  });

  it("updates context when /api/auth/me resolves with richer user data", async () => {
    fetchSpy.mockResolvedValue(
      new Response(JSON.stringify(FRESH_USER), { status: 200 })
    );

    const Wrapper = makeWrapper(queryClient);
    render(
      <Wrapper>
        <CurrentUserProvider initialUser={INITIAL_USER}>
          <CurrentUserDisplay />
        </CurrentUserProvider>
      </Wrapper>
    );

    // Initial state from SSR data
    expect(screen.getByText("hr@acme.co:HR_MANAGER")).toBeInTheDocument();

    // After refetch resolves, context should reflect the richer server data
    await waitFor(() =>
      expect(screen.getByText("hr@acme.co:HR_MANAGER,EMPLOYEE")).toBeInTheDocument()
    );
  });

  it("renders no-user when initialUser is null and fetch returns 401", async () => {
    fetchSpy.mockResolvedValue(new Response(null, { status: 401 }));

    const Wrapper = makeWrapper(queryClient);
    render(
      <Wrapper>
        <CurrentUserProvider initialUser={null}>
          <CurrentUserDisplay />
        </CurrentUserProvider>
      </Wrapper>
    );

    expect(screen.getByText("no-user")).toBeInTheDocument();
  });
});
