# Employee Onboarding Audit
_Date: 2026-05-18_

## Executive Summary

The employee creation flow is partially functional. An auth identity (`users` row) is created for every new employee who has an email address, via an async RabbitMQ listener in auth-service. The identity is created immediately active with the employee's phone number as the initial password. However, there is no first-login password-change enforcement anywhere in the codebase — no `mustChangePassword` flag, no dedicated change-password route in the frontend, and no invitation token mechanism. The welcome notification sent to the employee contains no credentials and no login URL. For the admin provisioning flow, the temporary password is returned in plaintext inside the `ProvisionedTenantResponse` JSON body; there is no email or SMS delivery of that password, and no first-login change-password requirement exists there either. The Africa's Talking SMS integration is present in code but permanently stubbed — the SDK is commented out and the `enabled` flag defaults to `false`.

---

## 1. Employee Creation Flow

### 1.1 Frontend (new employee form)

File: `frontend/tenant-portal/src/app/(admin)/admin/employees/new/page.tsx`

Fields collected:

| Field | Required in Frontend Validation | Backend annotation |
|---|---|---|
| firstName | Yes | `@NotBlank` |
| lastName | Yes | `@NotBlank` |
| phoneNumber | Yes — Kenyan phone regex | `@NotBlank @Pattern` |
| nationalId | Yes — 6–10 digits regex | `@NotBlank @Pattern` |
| kraPin | Yes — letter+9digits+letter regex | `@NotBlank @Pattern` |
| nhifNumber | Yes | `@NotBlank` |
| nssfNumber | Yes | `@NotBlank` |
| employmentType | Yes (select, defaults to PERMANENT) | `@NotNull` |
| basicSalary | Yes — positive number | `@NotNull @Positive` |
| email | Optional — no required validation | `@Email` (no `@NotBlank`) |
| hireDate | Optional | — |
| dateOfBirth | Optional | — |
| gender | Optional | — |
| departmentId | Optional | — |
| positionId | Optional | — |
| housingAllowance | Optional | — |
| transportAllowance | Optional | — |
| medicalAllowance | Optional | — |
| helbMonthlyDeduction | Optional | — |

Email is explicitly optional in the form, with the hint: "Optional — used for payslip email delivery if provided." Currency is hardcoded to `"KES"`.

Post-creation behaviour: on `onSuccess`, the React Query `employees` key is invalidated, a success toast is shown, and the router pushes to `/admin/employees/${data.id}`. There is no display of credentials, no mention of an invitation, and no instruction to the admin about how the employee will log in.

### 1.2 Backend (EmployeeService.create)

File: `services/employee-service/src/main/java/com/andikisha/employee/application/service/EmployeeService.java`

Step-by-step:

1. Extracts `tenantId` from `TenantContext`.
2. Deduplication checks on `nationalId`, `phoneNumber`, `email` (if present), and `kraPin` (if present).
3. Resolves `Department` and `Position` by tenant-scoped ID if provided.
4. Builds a `SalaryStructure` using `Money.of()`.
5. Calls `Employee.create(...)` and saves via `employeeRepository`.
6. Saves an `EmployeeHistory` record with event type `"CREATED"`.
7. Registers a `TransactionSynchronization.afterCommit()` callback that calls `eventPublisher.publishEmployeeCreated(created)`.
8. Returns `mapper.toDetailResponse(employee)`.

`EmployeeService.create()` does **not** call auth-service directly. It does not call any gRPC stub. Auth identity creation is entirely event-driven.

### 1.3 Auth Identity Gap

**A `users` row IS created — but only if the employee has an email address, and only after an async event round-trip.**

The chain:

1. `RabbitEmployeeEventPublisher.publishEmployeeCreated()` sends an `EmployeeCreatedEvent` to exchange `employee.events` with routing key `employee.created`.
   File: `services/employee-service/src/main/java/com/andikisha/employee/infrastructure/messaging/RabbitEmployeeEventPublisher.java`

2. auth-service has bound queue `auth.employee.created` to that exchange with routing key `employee.created`.
   File: `services/auth-service/src/main/java/com/andikisha/auth/infrastructure/config/RabbitMqConfig.java`

3. `EmployeeCreatedListener.onEmployeeCreated()` receives the event and **skips creation if `event.getEmail()` is null or blank** — logging a warning and returning.
   File: `services/auth-service/src/main/java/com/andikisha/auth/infrastructure/messaging/EmployeeCreatedListener.java`

4. If email is present, `authService.provisionEmployeeUser()` is called. The initial password is `event.getPhoneNumber()` if non-null, otherwise falls back to `event.getEmployeeNumber()`.

5. `AuthService.provisionEmployeeUser()` calls `User.create(tenantId, email, phone, passwordHash, Role.EMPLOYEE)` with `active = true`. The user is **immediately active** — there is no `PENDING_INVITATION` status, no `mustChangePassword` flag.

6. Critically: `provisionEmployeeUser()` accepts `employeeId` as a parameter but **never calls `user.linkEmployee(employeeId)`**. The `employee_id` column on the `users` row is left `NULL` for every employee provisioned through this path.

**Consequence of missing email:** If an HR admin omits the email field (which is optional in both the frontend and backend), no `users` row is created, and that employee has no way to log in to the portal at all.

**Consequence of phone-as-password:** The phone number is transmitted in the `EmployeeCreatedEvent` payload in plaintext. Any system with read access to RabbitMQ message history can recover it. There is no forced rotation on first login.

### 1.4 Events Published After Employee Creation

| Event class | Exchange | Routing key | Payload |
|---|---|---|---|
| `EmployeeCreatedEvent` | `employee.events` | `employee.created` | tenantId, employeeId, employeeNumber, firstName, lastName, email, phoneNumber, departmentId, basicSalary, currency |
| `EmployeeUpdatedEvent` | `employee.events` | `employee.updated` | tenantId, employeeId, updatedBy |
| `EmployeeTerminatedEvent` | `employee.events` | `employee.terminated` | tenantId, employeeId, reason, terminatedBy |
| `SalaryChangedEvent` | `employee.events` | `employee.salary_changed` | tenantId, employeeId, oldSalary, newSalary, currency, changedBy |

Only `EmployeeCreatedEvent` is relevant to onboarding. The event does not contain any credential information — the initial password is derived by the auth-service listener from the phone number field.

---

## 2. Admin Provisioning Flow

### 2.1 Temp Password Generation

File: `services/tenant-service/src/main/java/com/andikisha/tenant/application/service/SuperAdminTenantService.java`
File: `services/tenant-service/src/main/java/com/andikisha/tenant/application/service/PasswordGenerator.java`

`passwordGenerator.generate()` produces 20 characters from base-62 charset (`A-Za-z0-9`) using `SecureRandom`. Approximately 119 bits of entropy. Cryptographically sound.

### 2.2 Notification Mechanism

`temporaryPassword` is surfaced in exactly one place: the `ProvisionedTenantResponse` record returned in the HTTP response body of `POST /api/v1/super-admin/tenants`.

File: `services/tenant-service/src/main/java/com/andikisha/tenant/application/dto/response/ProvisionedTenantResponse.java` — field `String temporaryPassword`.

The flow in `SuperAdminTenantService`:
- Calls `authServiceClient.provisionInitialAdmin()` via gRPC synchronously inside the transaction.
- If that gRPC call fails, the exception is caught and logged — the HTTP response still returns 201 with a `temporaryPassword` field, but no `users` row exists. The super admin is unaware.
- No email or SMS is sent for the temporary password. The `TenantCreatedEvent` published via `tenantEventPublisher.publishTenantCreated(savedTenant)` is consumed by notification-service's `TenantEventListener`, which sends a welcome email — but that email contains only a welcome message, not the credentials.

The temporary password is **exclusively delivered as a JSON field in the super-admin API response**. There is no email, no SMS, and no in-app delivery.

### 2.3 First Login Experience

No `mustChangePassword` or equivalent field exists in the `User` entity or the `users` table. No `PENDING_INVITATION` or `INVITED` status exists.

The frontend login page redirects to the role-appropriate dashboard after successful login with no check for a change-password requirement. There is no `/change-password` route in the frontend. The `AuthController` exposes `POST /api/v1/auth/change-password` but it is not linked from the post-login flow.

The "Forgot Password?" button in `login/page.tsx` is a `<button type="button">` with no `onClick` handler — it is a dead UI element.

---

## 3. Notification-Service Current State

### 3.1 Channels

| Channel | Status |
|---|---|
| EMAIL | Functional — `SpringMailEmailSender` uses Spring `JavaMailSender`, sends both plain text and HTML. Requires SMTP config via `app.notifications.email.*` properties. |
| SMS | Present in code, permanently disabled by default. See 3.2. |
| IN_APP | Functional — `Notification` rows written to DB, readable via `GET /api/v1/notifications`. |
| PUSH | Stubbed — `LoggingPushSender` only logs; comment says "Firebase Cloud Messaging integration goes here in production." |

### 3.2 Africa's Talking Integration

File: `services/notification-service/src/main/java/com/andikisha/notification/infrastructure/sms/AfricasTalkingSmsSender.java`

The integration is present as a class but the SDK is not imported. The actual send calls are commented out. The `enabled` flag defaults to `false` via `@Value("${app.notifications.sms.enabled:false}")`. When `enabled = false`, `send()` logs the message and returns immediately without making any network call.

**The Africa's Talking SDK is not in any `build.gradle`.** Setting `app.notifications.sms.enabled=true` in production will not send SMS — the method returns early on the `!enabled` guard. The SDK dependency is absent from the build.

### 3.3 Event Listeners

| Listener | Queue | Events handled |
|---|---|---|
| `EmployeeEventListener` | `notification.employee-events` | `EmployeeCreatedEvent` (multi-channel), `EmployeeTerminatedEvent` (IN_APP only) |
| `TenantEventListener` | `notification.tenant-events` | `TenantCreatedEvent` (EMAIL only — welcome message, no credentials) |
| `PayrollEventListener` | `notification.payroll-events` | `PayrollApprovedEvent` (IN_APP), `PayrollProcessedEvent` (logged only) |
| `LeaveEventListener` | `notification.leave-events` | `LeaveApprovedEvent` (IN_APP), `LeaveRejectedEvent` (IN_APP) |

### 3.4 Existing Templates

There are no template files (Thymeleaf, Freemarker, Mustache, or otherwise). All notification body text is assembled by string concatenation inline in listener methods. The `EmployeeEventListener.handleCreated()` method builds this body:

```
Welcome aboard! Your employee number is {employeeNumber}.
You can access the employee portal to view your payslips, submit leave requests, and update your profile.
If you have any questions, please contact the HR department.
```

No login URL is included. No initial password or instructions for how to access the portal are included.

---

## 4. Auth-Service Schema

### 4.1 Users Table

File: `services/auth-service/src/main/resources/db/migration/V2__create_users.sql`

| Column | Nullable | Default | Notes |
|---|---|---|---|
| `password_hash` | NOT NULL | — | Cannot be null; phone number is used as initial value |
| `is_active` | NOT NULL | TRUE | Employees provisioned as immediately active |
| `role` | NOT NULL | `'EMPLOYEE'` | — |
| `employee_id` | NULL | — | **Never set** by `provisionEmployeeUser()` |
| `last_login` | NULL | — | — |
| `locked_until` | NULL | — | — |

There is no `status` column beyond `is_active`. No `PENDING_INVITATION`, `INVITED`, or `MUST_CHANGE_PASSWORD` status concept exists anywhere in the schema or entity. All 12 Flyway migrations (V1–V12) searched; none adds a password-change enforcement column or invitation status.

### 4.2 Invitation Infrastructure

No `invitation_tokens` table exists. No token-based invitation mechanism exists in any Java file in auth-service. The `ChangePasswordRequest` DTO exists and the endpoint is wired, but there is no mechanism to require an employee to use it on first login.

---

## 5. Gap Analysis

| Gap | Severity | Notes |
|---|---|---|
| No auth identity created when email is omitted | **Critical** | Email is optional on the employee form. An employee without email has no `users` row and can never log in. Affects phone-only environments common in Kenya. |
| `employee_id` column never linked after provisioning | **Critical** | `provisionEmployeeUser()` accepts `employeeId` but never calls `user.linkEmployee(employeeId)`. `getUserByEmployeeId()` always throws `ResourceNotFoundException` for employees created this way. Breaks any feature that resolves a user from an employee UUID. |
| Phone number used as initial password | **High** | Phone number appears in the `EmployeeCreatedEvent` payload in plaintext. Trivially guessable; broadly known from payslips, business cards, etc. |
| No forced first-login password change | **High** | No `mustChangePassword` flag, no DB column, no frontend route, no middleware guard. Employee can use the phone-number password indefinitely without being prompted to change it. |
| Welcome notification contains no credentials or login URL | **High** | `EmployeeEventListener.handleCreated()` sends a generic welcome message with employee number. No portal URL, no username, no credential delivery. Employee has no actionable path to log in. |
| Auth provisioning of admin can silently fail | **High** | `SuperAdminTenantService` catches the exception from `authServiceClient.provisionInitialAdmin()` and logs without re-throwing. HTTP response returns 201 with a temp password, but no `users` row may exist. |
| Temporary admin password not emailed or SMSed | **Medium** | Password is returned only in the JSON API response body. Super admin must manually communicate it. No out-of-band delivery exists. |
| Africa's Talking SMS SDK not in build | **Medium** | `AfricasTalkingSmsSender` is a stub. Setting `sms.enabled=true` in any environment will not send SMS. The dependency is absent from `build.gradle`. |
| Welcome notification email contains no login URL | **Medium** | Even for employees with email, the notification body has no URL to the portal. |
| "Forgot Password?" button is dead | **Low** | `login/page.tsx`: `<button type="button">` with no `onClick`. No password reset flow exists anywhere. |
| No `invitation_tokens` table | **Low** | If a token-based invite flow is built, it requires a new migration and endpoint in auth-service. |

---

## 6. Recommended Implementation Path

Ordered by dependency:

1. Fix `provisionEmployeeUser()` to call `user.linkEmployee(UUID.fromString(employeeId))` before saving. (Immediate, no schema change.)
2. Add `must_change_password` boolean column to `users` table (Flyway V13). Default `true` for all provisioned users.
3. Decide the no-email case: make email required on the employee form, or define a USSD-only auth path. The `UssdAuthService` exists and authenticates by phone number + PIN — verify if it covers this case.
4. Replace phone-as-password: generate a secure random initial password via `PasswordGenerator` (move to `andikisha-common`). Include it — or a set-password link — in the welcome notification.
5. Extend welcome notification body in `EmployeeEventListener.handleCreated()` to include portal URL and credential delivery instructions.
6. Add a `/my/change-password` route to the frontend and enforce it on first login via middleware (check `must_change_password` in the BFF `/api/auth/me` response).
7. Add Africa's Talking SDK to `notification-service/build.gradle` and implement the actual send call in `AfricasTalkingSmsSender`.
8. Fix the "Forgot Password?" dead button: implement `POST /api/v1/auth/request-password-reset` + `POST /api/v1/auth/reset-password` with a token stored in Redis (TTL-keyed, no table needed for simple reset).
9. Add a circuit-breaker or Dead Letter Queue retry for the admin provisioning gRPC call in `SuperAdminTenantService` so silent failures become visible.

---

## 7. Open Questions for Lawrence

1. **Phone-only employees:** Is the intent that employees without email addresses log in via USSD exclusively? The `UssdAuthService` authenticates by phone number + PIN and may cover this. Or should email become a required field for portal access?

2. **Initial credential delivery channel:** Should the initial password (or set-password link) be sent by SMS, email, or both? SMS is more reliable for Kenyan SMEs but currently not deployed. Email is deployed but not all employees have addresses.

3. **`must_change_password` vs magic link:** Do you want employees to receive a one-time magic link (click-to-set-password) or a temporary password they must change on first login? Magic links require the `invitation_tokens` infrastructure. Temp password + forced change is simpler but still requires the V13 migration.

4. **Admin silent failure strategy:** When `provisionInitialAdmin()` fails via gRPC, should the entire tenant creation roll back, or should there be a retry mechanism visible to the super-admin (e.g., a "resend admin invite" button in the platform portal)?

5. **`EmployeeCreatedEvent` payload security:** The event carries `phoneNumber` in plaintext in RabbitMQ. Should the initial-password derivation move entirely into auth-service (auth generates a random token) rather than deriving from the event field?

6. **HR/Payroll staff provisioning:** The `Role` enum has `ADMIN`, `EMPLOYEE`, `HR_MANAGER`, `SUPER_ADMIN`, and `HR`. How should non-admin HR staff (`HR_MANAGER`, `PAYROLL_OFFICER`) be onboarded — same employee creation flow, or a separate provisioning path that bypasses the employee record?

---

## Primary Files Referenced

- `services/employee-service/src/main/java/com/andikisha/employee/application/service/EmployeeService.java`
- `services/employee-service/src/main/java/com/andikisha/employee/infrastructure/messaging/RabbitEmployeeEventPublisher.java`
- `services/auth-service/src/main/java/com/andikisha/auth/infrastructure/messaging/EmployeeCreatedListener.java`
- `services/auth-service/src/main/java/com/andikisha/auth/application/service/AuthService.java`
- `services/auth-service/src/main/java/com/andikisha/auth/domain/model/User.java`
- `services/auth-service/src/main/java/com/andikisha/auth/infrastructure/config/RabbitMqConfig.java`
- `services/auth-service/src/main/resources/db/migration/V2__create_users.sql`
- `services/tenant-service/src/main/java/com/andikisha/tenant/application/service/SuperAdminTenantService.java`
- `services/tenant-service/src/main/java/com/andikisha/tenant/application/service/PasswordGenerator.java`
- `services/tenant-service/src/main/java/com/andikisha/tenant/application/dto/response/ProvisionedTenantResponse.java`
- `services/notification-service/src/main/java/com/andikisha/notification/application/listener/EmployeeEventListener.java`
- `services/notification-service/src/main/java/com/andikisha/notification/application/listener/TenantEventListener.java`
- `services/notification-service/src/main/java/com/andikisha/notification/infrastructure/sms/AfricasTalkingSmsSender.java`
- `services/notification-service/src/main/java/com/andikisha/notification/infrastructure/email/SpringMailEmailSender.java`
- `frontend/tenant-portal/src/app/(admin)/admin/employees/new/page.tsx`
- `frontend/tenant-portal/src/app/login/page.tsx`
