# Session Timeout — Design

**Date:** 2026-05-19  
**Scope:** Idle timeout, warning prompt, hard timeout behaviour, token refresh, and error handling for both portals. Implementation deferred pending Lawrence review.

---

## 1. Context

Two portals, different usage patterns:

**tenant-portal (port 3000)** — HR admins and employees. Tasks range from 2-minute payslip checks (employee) to 45-minute payroll runs (HR). Sessions left open on shared office computers are a real risk.

**platform-portal (port 3003)** — SUPER_ADMIN only. Tasks often involve long customer calls, multi-step provisioning, or live support sessions where the SUPER_ADMIN has the portal open but is talking rather than clicking.

---

## 2. Idle Threshold

| Portal | Idle timeout | Rationale |
|---|---|---|
| tenant-portal | 30 minutes | Matches common SaaS defaults. Balances security (shared office computers) against usability (payroll runs take 20–30 minutes and require periodic saves, not continuous interaction). |
| platform-portal | 60 minutes | SUPER_ADMIN support calls routinely exceed 30 minutes. A 30-minute timeout would interrupt active customer sessions. |

**Definition of idle:** no keyboard input, mouse click, or scroll event on the page within the threshold window. Background polling (React Query `refetchInterval`) does NOT reset the idle timer — only user-initiated interactions do.

---

## 3. Warning Prompt

Shown **2 minutes before** the idle threshold elapses.

**Content:**
```
┌─────────────────────────────────────────────┐
│  Still there?                               │
│                                             │
│  You'll be signed out in 2 minutes due to   │
│  inactivity.                                │
│                                             │
│        [Stay signed in]    [Sign out now]   │
└─────────────────────────────────────────────┘
```

**"Stay signed in":** resets the idle timer to zero. No network request required — the warning dismissal itself counts as user activity.

**"Sign out now":** calls the logout BFF endpoint, clears the cookie, redirects to `/login`.

**Auto-dismiss:** if the user interacts with anything on the page (including clicking anywhere outside the prompt), the prompt dismisses and the timer resets. The prompt does not steal focus or block page interaction.

**Positioning:** fixed, bottom-right corner. Does not overlay the main content area. Uses the same `Toaster` positioning slot but is not a toast — it is a persistent card that stays until dismissed or timeout fires.

---

## 4. Hard Timeout Behaviour

When the idle threshold elapses with no user activity:

1. Clear the auth cookie (`tenant_token` or `platform_token`)
2. Call the logout BFF endpoint (fire-and-forget — do not wait for response before redirecting)
3. Show toast: "Session expired. Please sign in again."
4. Redirect to `/login`

No recovery path — the user must re-authenticate. In-progress work is lost (see §7 on unsaved work).

The redirect must include the current path as a `returnTo` param so the user lands back where they were after login:
```
/login?returnTo=/admin/employees
```

The login page reads `returnTo` and redirects after successful authentication. `returnTo` is validated against same-origin paths only — no open redirect.

---

## 5. Token Refresh (Silent Background Refresh)

Access tokens have a short TTL (1 hour per current auth-service config). Refresh tokens have a longer TTL (7 days). The idle timeout (30/60 min) is shorter than the access token TTL, so token expiry will not occur during a normal idle session.

**When silent refresh IS needed:** sessions that stay active beyond 1 hour (SUPER_ADMIN long call, or a tenant admin who left the portal open and came back). The refresh flow:

1. React Query's `refetchOnWindowFocus` triggers when the user returns to the tab
2. An API call fails with 401
3. The `apiClient` interceptor catches the 401 and calls `POST /api/auth/refresh`
4. If the refresh token is still valid: new access token issued, original request retried
5. If the refresh token has expired: redirect to `/login`

This is already partially wired via the `401 → redirect to /login` interceptor. The missing piece is the retry-with-refresh logic (step 4). That is V2 scope — for now, a 401 from an expired access token sends the user to login directly.

**V1 behaviour:** sessions expire at access token TTL (1 hour). The idle timeout (30/60 min) fires before the token expires in normal use. For sessions left open overnight, the user will see a 401 redirect on next interaction rather than a timeout prompt — acceptable for V1.

---

## 6. Error Handling

| Condition | Behaviour |
|---|---|
| Token refresh fails (network error) | Toast: "Session expired, please sign in again." → redirect to `/login?returnTo=...` |
| Token refresh fails (refresh token expired) | Same as above |
| Logout BFF call fails (server down) | Still clear cookie and redirect — client-side logout is sufficient for security |
| Warning prompt shown, user closes tab | Next session starts fresh — no recovery |

---

## 7. Unsaved Work (V2)

Forms with dirty state (payroll run in progress, employee edit) can lose work if timeout fires mid-edit.

**V1:** accept the loss. The timeout is 30 minutes — long enough for most editing tasks. The warning prompt fires at 28 minutes, giving the user 2 minutes to save before losing work.

**V2 (deferred):** form pages register with a global `dirty` state. If `dirty=true` when the warning prompt appears, add additional warning text: "You have unsaved changes. Save your work before your session expires." If timeout fires while dirty, show a stronger confirmation prompt before redirecting.

---

## 8. Implementation Scope (V1)

When Lawrence approves:

**Shared hook: `useIdleTimeout(thresholdMs, warningMs)`**  
Attaches `mousemove`, `keydown`, `click`, `scroll` listeners. Returns `{ status: "active" | "warning" | "expired" }`. Lives in `@andikisha/ui` or as an app-level hook.

**Warning component: `IdleWarningBanner`**  
Renders the warning card (§3). Accepts `onStaySignedIn` and `onSignOut` callbacks.

**Hard timeout handler**  
Clears cookie, calls logout endpoint, redirects to `/login?returnTo=...`.

**tenant-portal integration**  
Mount in the `(my)/layout.tsx` and `(admin)/layout.tsx` root layouts with `thresholdMs=1800000` (30 min), `warningMs=120000` (2 min).

**platform-portal integration**  
Mount in the `(platform)/layout.tsx` root layout with `thresholdMs=3600000` (60 min), `warningMs=120000` (2 min).

---

## 9. Open Questions

**Q1 — Should refresh token rotation be implemented before or after session timeout?**  
Refresh token rotation (issuing a new refresh token on each access token refresh) closes a token theft window. It's independent of timeout but is naturally paired with it. Recommend implementing in the same sprint.

**Q2 — returnTo validation: which paths are safe?**  
`returnTo` should only accept paths starting with `/my/` or `/admin/` (tenant-portal) or `/` (platform-portal). Any other value redirects to the default dashboard. Needs an allowlist in the login page.

**Q3 — Idle timer reset on API polling: confirm exclusion.**  
Background polling should not reset the idle timer. Confirm this matches the expectation — it means a user who has only background tabs open will still be timed out, even though the app is making requests.
