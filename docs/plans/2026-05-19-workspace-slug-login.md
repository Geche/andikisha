# Workspace-Slug Login Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the per-deployment `TENANT_ID` env var with a single multi-tenant tenant-portal that resolves a workspace slug at login time, fixing Issue 2 (newly provisioned tenant admins cannot log in).

**Architecture:** Add `workspace_slug` (unique, kebab-case, max 50 chars) to `Tenant`; backfill via Flyway V8. Add a public `GET /api/v1/public/tenants/resolve?slug=...` endpoint (no JWT required) in tenant-service, routed through api-gateway. Tenant-portal login gets a Workspace field; the BFF resolves slug → tenantId before calling auth-service, removing the static `TENANT_ID` env var. Platform-portal provision form auto-generates the slug, lets SUPER_ADMIN override it, and surfaces it in the success modal and tenant detail page.

**Tech Stack:** Spring Boot 3.4 / Java 21 (tenant-service, api-gateway, auth-service), PostgreSQL 16 + Flyway (V8 migration), Next.js 15 App Router BFF (tenant-portal, platform-portal), RabbitMQ event shape update (shared/andikisha-events).

---

## Deployment Notes (Amendment 1)

Deploy in this order to prevent "Workspace: null" in welcome emails during the rollout window:

1. **notification-service first** — tolerates null `workspaceSlug` in `TenantCreatedEvent` (Jackson ignores unknown fields); welcome email already handles null gracefully after Task 4 (Step 3)
2. **tenant-service second** — now emits `workspaceSlug` in events; notification-service is already prepared to receive it

Deploying in reverse order creates a window where `workspaceSlug` is emitted but the old notification-service renders `"Workspace: null"` in the welcome email sent to real customers. Never do reverse order.

---

## Pre-execution Finding (three TENANT_ID references, not one)

`grep -rn "TENANT_ID" frontend/tenant-portal/src/` found three files:

| File | Status |
|---|---|
| `api/auth/login/route.ts` | Fixed in Task 7 (planned) |
| `api/auth/forgot-password/route.ts` | Fixed in Task 7 (added below) |
| `api/auth/reset-password/route.ts` | Fixed in Task 7 (added below) |

**`forgot-password` fix:** BFF accepts `{ email, workspace }`. Resolves workspace → tenantId silently (always returns 204 regardless — no enumeration). Workspace pre-filled in forgot-password modal from main form's workspace state.

**`reset-password` fix:** `AuthService.resetPassword()` reads tenant from Redis (stored as `userId:tenantId` at forgot-password time) — never calls `TenantContext.requireTenantId()`. Remove from `TenantInterceptor` in auth-service `WebMvcConfig`; BFF drops `X-Tenant-ID` entirely.

---

## File Map

**New files:**
- `services/tenant-service/src/main/resources/db/migration/V8__add_workspace_slug.sql`
- `services/tenant-service/src/main/java/com/andikisha/tenant/application/service/SlugGeneratorService.java`
- `services/tenant-service/src/main/java/com/andikisha/tenant/application/dto/response/TenantSlugResponse.java`
- `services/tenant-service/src/main/java/com/andikisha/tenant/presentation/controller/PublicTenantController.java`

**Additional modified files (Amendment 1 + pre-execution finding):**
- `services/auth-service/src/main/java/com/andikisha/auth/infrastructure/config/WebMvcConfig.java` — exclude `/api/v1/auth/reset-password` from TenantInterceptor
- `frontend/tenant-portal/src/app/api/auth/forgot-password/route.ts` — resolve workspace → tenantId before forwarding
- `frontend/tenant-portal/src/app/api/auth/reset-password/route.ts` — remove TENANT_ID dependency entirely

**Modified files:**
- `services/tenant-service/src/main/java/com/andikisha/tenant/domain/model/Tenant.java` — add `workspaceSlug` field + getter, update `Tenant.create()`
- `services/tenant-service/src/main/java/com/andikisha/tenant/domain/repository/TenantRepository.java` — add `findByWorkspaceSlug`, `existsByWorkspaceSlug`
- `services/tenant-service/src/main/java/com/andikisha/tenant/application/dto/request/CreateTenantWithLicenceRequest.java` — add optional `workspaceSlug`
- `services/tenant-service/src/main/java/com/andikisha/tenant/application/dto/response/ProvisionedTenantResponse.java` — add `workspaceSlug`
- `services/tenant-service/src/main/java/com/andikisha/tenant/application/dto/response/TenantDetailResponse.java` — add `workspaceSlug`
- `services/tenant-service/src/main/java/com/andikisha/tenant/application/dto/response/TenantSummaryResponse.java` — add `workspaceSlug`
- `services/tenant-service/src/main/java/com/andikisha/tenant/application/service/SuperAdminTenantService.java` — wire slug generation into provision + response builders
- `services/tenant-service/src/main/java/com/andikisha/tenant/infrastructure/config/SecurityConfig.java` — permit `/api/v1/public/**`
- `services/api-gateway/src/main/resources/application.yml` — add public route before existing tenant-service route
- `shared/andikisha-events/src/main/java/com/andikisha/events/tenant/TenantCreatedEvent.java` — add `workspaceSlug`
- `services/tenant-service/src/main/java/com/andikisha/tenant/infrastructure/messaging/RabbitTenantEventPublisher.java` — pass slug in `publishTenantCreated`
- `services/notification-service/src/main/java/com/andikisha/notification/application/listener/TenantEventListener.java` — update welcome email body
- `frontend/platform-portal/src/app/(platform)/tenants/new/page.tsx` — workspace slug field + success modal update
- `frontend/platform-portal/src/app/(platform)/tenants/[tenantId]/page.tsx` — show slug in identity strip
- `frontend/tenant-portal/src/app/login/page.tsx` — Workspace field (3-field login)
- `frontend/tenant-portal/src/app/api/auth/login/route.ts` — resolve slug → tenantId, remove `TENANT_ID` dependency

---

### Task 1: Flyway V8 migration + Tenant entity + TenantRepository

**Files:**
- Create: `services/tenant-service/src/main/resources/db/migration/V8__add_workspace_slug.sql`
- Modify: `services/tenant-service/src/main/java/com/andikisha/tenant/domain/model/Tenant.java`
- Modify: `services/tenant-service/src/main/java/com/andikisha/tenant/domain/repository/TenantRepository.java`

- [ ] **Step 1: Write V8 migration SQL**

```sql
-- V8__add_workspace_slug.sql

-- 1. Add nullable column first (allows safe backfill)
ALTER TABLE tenants ADD COLUMN workspace_slug VARCHAR(50);

-- 2. Backfill: generate unique kebab-case slugs from company_name
DO $$
DECLARE
    rec       RECORD;
    base_slug TEXT;
    candidate TEXT;
    n         INT;
BEGIN
    FOR rec IN SELECT id, company_name FROM tenants ORDER BY created_at LOOP
        -- lowercase → replace non-alphanumeric runs with '-' → strip leading/trailing '-'
        base_slug := lower(rec.company_name);
        base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
        base_slug := regexp_replace(base_slug, '^-+|-+$', '', 'g');
        base_slug := left(base_slug, 50);
        -- Trim trailing '-' again after truncation
        base_slug := regexp_replace(base_slug, '-+$', '');

        candidate := base_slug;
        n         := 1;
        WHILE EXISTS (SELECT 1 FROM tenants WHERE workspace_slug = candidate) LOOP
            candidate := left(base_slug, 47) || '-' || n;
            n         := n + 1;
        END LOOP;

        UPDATE tenants SET workspace_slug = candidate WHERE id = rec.id;
    END LOOP;
END $$;

-- 3. Override demo tenant slug to 'demo' (Amendment 2).
--    Auto-generation from company_name yields e.g. "andikisha-demo-co" which is painful to type.
--    'demo' is the canonical dev/staging workspace identifier.
--    If another row already claimed 'demo', reassign it to 'demo-2'.
DO $$
DECLARE
    demo_id UUID;
    old_slug TEXT;
BEGIN
    SELECT id INTO demo_id FROM tenants WHERE company_name ILIKE '%demo%' ORDER BY created_at LIMIT 1;
    IF demo_id IS NOT NULL THEN
        SELECT workspace_slug INTO old_slug FROM tenants WHERE id = demo_id;
        -- Free up 'demo' if another row holds it
        UPDATE tenants SET workspace_slug = old_slug || '-2'
        WHERE workspace_slug = 'demo' AND id != demo_id;
        UPDATE tenants SET workspace_slug = 'demo' WHERE id = demo_id;
    END IF;
END $$;

-- 4. Enforce NOT NULL + UNIQUE now that all rows have a value
ALTER TABLE tenants ALTER COLUMN workspace_slug SET NOT NULL;
ALTER TABLE tenants ADD CONSTRAINT uk_tenants_workspace_slug UNIQUE (workspace_slug);

-- 4. Index for O(1) slug resolution at login time
CREATE INDEX idx_tenants_workspace_slug ON tenants (workspace_slug);
```

- [ ] **Step 2: Add `workspaceSlug` to Tenant entity**

In `Tenant.java`, add the field after `suspensionReason`:

```java
@Column(name = "workspace_slug", nullable = false, unique = true, length = 50)
private String workspaceSlug;
```

Update `Tenant.create()` to accept and set the slug (add `String workspaceSlug` as last parameter):

```java
public static Tenant create(String companyName, String country,
                            String currency, String adminEmail,
                            String adminPhone, Plan plan, String workspaceSlug) {
    Tenant tenant = new Tenant();
    tenant.companyName = companyName;
    tenant.country = country.toUpperCase();
    tenant.currency = currency.toUpperCase();
    tenant.adminEmail = adminEmail.toLowerCase().trim();
    tenant.adminPhone = adminPhone;
    tenant.plan = plan;
    tenant.status = TenantStatus.TRIAL;
    tenant.trialEndsAt = LocalDate.now().plusDays(14);
    tenant.payFrequency = "MONTHLY";
    tenant.payDay = 28;
    tenant.workspaceSlug = workspaceSlug;
    return tenant;
}
```

Add getter at the bottom of the getters block:

```java
public String getWorkspaceSlug() { return workspaceSlug; }
```

- [ ] **Step 3: Add slug query methods to TenantRepository**

```java
Optional<Tenant> findByWorkspaceSlug(String workspaceSlug);
boolean existsByWorkspaceSlug(String workspaceSlug);
```

- [ ] **Step 4: Compile tenant-service to verify changes**

```bash
cd services/tenant-service
../gradlew compileJava -x compileTestJava
```

Expected: BUILD SUCCESSFUL (one compile error if callers of `Tenant.create()` haven't been updated yet — fix in Task 2).

- [ ] **Step 5: Commit**

```bash
git add services/tenant-service/src/main/resources/db/migration/V8__add_workspace_slug.sql \
        services/tenant-service/src/main/java/com/andikisha/tenant/domain/model/Tenant.java \
        services/tenant-service/src/main/java/com/andikisha/tenant/domain/repository/TenantRepository.java
git commit -m "feat(tenant): add workspace_slug — V8 migration, entity field, repo methods"
```

---

### Task 2: SlugGeneratorService + provision flow + response DTOs

**Files:**
- Create: `services/tenant-service/src/main/java/com/andikisha/tenant/application/service/SlugGeneratorService.java`
- Modify: `services/tenant-service/src/main/java/com/andikisha/tenant/application/dto/request/CreateTenantWithLicenceRequest.java`
- Modify: `services/tenant-service/src/main/java/com/andikisha/tenant/application/dto/response/ProvisionedTenantResponse.java`
- Modify: `services/tenant-service/src/main/java/com/andikisha/tenant/application/dto/response/TenantDetailResponse.java`
- Modify: `services/tenant-service/src/main/java/com/andikisha/tenant/application/dto/response/TenantSummaryResponse.java`
- Modify: `services/tenant-service/src/main/java/com/andikisha/tenant/application/service/SuperAdminTenantService.java`

- [ ] **Step 1: Create SlugGeneratorService**

```java
package com.andikisha.tenant.application.service;

import com.andikisha.tenant.domain.repository.TenantRepository;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class SlugGeneratorService {

    private final TenantRepository tenantRepository;

    public SlugGeneratorService(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    /**
     * Generates a unique kebab-case slug.
     * If {@code requested} is non-blank, validates and deduplicates it.
     * Otherwise derives the slug from {@code organisationName}.
     */
    public String generate(String organisationName, String requested) {
        String base = (requested != null && !requested.isBlank())
                ? sanitize(requested)
                : toSlug(organisationName);
        return deduplicate(base);
    }

    /** Converts a free-text name to a kebab-case slug, max 50 chars. */
    public static String toSlug(String name) {
        String slug = name.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");
        return slug.length() > 50 ? slug.substring(0, 50).replaceAll("-+$", "") : slug;
    }

    private String sanitize(String raw) {
        // Accept submitted slug as-is after normalisation; trust frontend validation
        return toSlug(raw);
    }

    private String deduplicate(String base) {
        if (!tenantRepository.existsByWorkspaceSlug(base)) {
            return base;
        }
        int n = 1;
        String candidate;
        String truncBase = base.length() > 47 ? base.substring(0, 47) : base;
        do {
            candidate = truncBase + "-" + n;
            n++;
        } while (tenantRepository.existsByWorkspaceSlug(candidate));
        return candidate;
    }
}
```

- [ ] **Step 2: Add optional `workspaceSlug` to CreateTenantWithLicenceRequest**

Append as the last field (nullable — null means auto-generate):

```java
@Pattern(
    regexp = "^[a-z0-9]+(-[a-z0-9]+)*$",
    message = "Workspace slug must be lowercase letters, numbers, and hyphens only"
)
@Size(max = 50, message = "Workspace slug must not exceed 50 characters")
String workspaceSlug   // null → auto-generated from organisationName
```

- [ ] **Step 3: Add `workspaceSlug` to ProvisionedTenantResponse**

Replace the record definition:

```java
public record ProvisionedTenantResponse(
        UUID tenantId,
        String organisationName,
        String workspaceSlug,
        UUID licenceKey,
        LicenceStatus licenceStatus,
        String planName,
        String adminEmail,
        String temporaryPassword,
        int seatCount,
        LocalDate endDate
) {}
```

- [ ] **Step 4: Add `workspaceSlug` to TenantDetailResponse**

```java
public record TenantDetailResponse(
        UUID tenantId,
        String organisationName,
        String workspaceSlug,
        String status,
        LocalDateTime createdAt,
        String adminEmail,
        String adminPhone,
        String kraPin,
        String nssfNumber,
        String shifNumber,
        String payFrequency,
        int payDay,
        String suspensionReason,
        LocalDate trialEndsAt,
        LicenceResponse currentLicence
) {}
```

- [ ] **Step 5: Add `workspaceSlug` to TenantSummaryResponse**

```java
public record TenantSummaryResponse(
        UUID tenantId,
        String organisationName,
        String workspaceSlug,
        String status,
        String planName,
        Integer seatCount,
        LocalDate endDate,
        String adminEmail,
        LocalDateTime createdAt
) {}
```

- [ ] **Step 6: Update SuperAdminTenantService**

Inject `SlugGeneratorService` via constructor. Update `createTenantWithLicence`:

Replace the Tenant creation block (lines 101-105) with:

```java
// 1. Generate (or validate and deduplicate) the workspace slug.
String workspaceSlug = slugGeneratorService.generate(
        request.organisationName(), request.workspaceSlug());

// 2. Validate slug uniqueness (before creating tenant to give a clear error).
if (tenantRepository.existsByWorkspaceSlug(workspaceSlug)) {
    throw new DuplicateResourceException("Tenant", "workspaceSlug", workspaceSlug);
}

// 3. Create the tenant aggregate.
Tenant tenant = Tenant.create(
        request.organisationName(), DEFAULT_COUNTRY, DEFAULT_CURRENCY,
        normalizedEmail, request.adminPhone(), plan, workspaceSlug);
Tenant savedTenant = tenantRepository.save(tenant);
```

Update the `ProvisionedTenantResponse` constructor call to include `savedTenant.getWorkspaceSlug()` as the third argument (after `organisationName`).

Update `getTenantDetail` — add `tenant.getWorkspaceSlug()` as the second argument (after `tenant.getId()`).

Update `toSummaryWithLicence` — add `tenant.getWorkspaceSlug()` as the second argument (after `tenant.getId()`).

- [ ] **Step 7: Compile and verify**

```bash
cd services/tenant-service
../gradlew compileJava -x compileTestJava
```

Expected: BUILD SUCCESSFUL

- [ ] **Step 8: Commit**

```bash
git add services/tenant-service/src/main/java/com/andikisha/tenant/application/
git commit -m "feat(tenant): slug generator, updated provision flow + response DTOs"
```

---

### Task 3: Public resolve endpoint + SecurityConfig + gateway route

**Files:**
- Create: `services/tenant-service/src/main/java/com/andikisha/tenant/application/dto/response/TenantSlugResponse.java`
- Create: `services/tenant-service/src/main/java/com/andikisha/tenant/presentation/controller/PublicTenantController.java`
- Modify: `services/tenant-service/src/main/java/com/andikisha/tenant/infrastructure/config/SecurityConfig.java`
- Modify: `services/api-gateway/src/main/resources/application.yml`

- [ ] **Step 1: Create TenantSlugResponse**

```java
package com.andikisha.tenant.application.dto.response;

public record TenantSlugResponse(
        String tenantId,
        String organisationName,
        String status
) {}
```

- [ ] **Step 2: Create PublicTenantController**

```java
package com.andikisha.tenant.presentation.controller;

import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.tenant.application.dto.response.TenantSlugResponse;
import com.andikisha.tenant.domain.model.Tenant;
import com.andikisha.tenant.domain.model.TenantStatus;
import com.andikisha.tenant.domain.repository.TenantRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/tenants")
public class PublicTenantController {

    private final TenantRepository tenantRepository;

    public PublicTenantController(TenantRepository tenantRepository) {
        this.tenantRepository = tenantRepository;
    }

    /**
     * Resolves a workspace slug to a tenant ID. No authentication required.
     * Called by the tenant-portal BFF before the login request so the BFF
     * can send the correct X-Tenant-ID without a per-deployment env var.
     *
     * Returns 404 if the slug doesn't exist.
     * Returns 403 if the tenant is CANCELLED or DELETED — avoids revealing
     * that the workspace once existed while preventing login.
     */
    @GetMapping("/resolve")
    public ResponseEntity<TenantSlugResponse> resolve(@RequestParam String slug) {
        Tenant tenant = tenantRepository.findByWorkspaceSlug(slug.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Workspace", slug));

        if (tenant.getStatus() == TenantStatus.CANCELLED
                || tenant.getStatus() == TenantStatus.DELETED) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(new TenantSlugResponse(
                tenant.getTenantId(),
                tenant.getCompanyName(),
                tenant.getStatus().name()
        ));
    }
}
```

- [ ] **Step 3: Permit `/api/v1/public/**` in SecurityConfig**

Add `"/api/v1/public/**"` to the existing `permitAll()` block:

```java
.requestMatchers(
        "/actuator/health/**",
        "/v3/api-docs/**",
        "/swagger-ui/**",
        "/api/v1/plans",
        "/api/v1/plans/**",
        "/api/v1/public/**"
).permitAll()
```

- [ ] **Step 4: Add public gateway route**

In `services/api-gateway/src/main/resources/application.yml`, add the following route **before** the existing `- id: tenant-service` block (order matters — Spring Cloud Gateway matches first-wins):

```yaml
        - id: public-tenant-resolve
          uri: ${TENANT_SERVICE_URL:http://localhost:8083}
          predicates:
            - Path=/api/v1/public/**
          # No auth filter — this path is intentionally public
```

- [ ] **Step 5: Compile and start tenant-service**

```bash
cd services/tenant-service
../gradlew compileJava -x compileTestJava
```

Start tenant-service and run a quick smoke test (assumes demo slug was backfilled by V8 migration):

```bash
curl -s "http://localhost:8080/api/v1/public/tenants/resolve?slug=demo" | jq .
```

Expected response:
```json
{
  "tenantId": "1cc12430-7c3a-45b7-8973-469622778c9d",
  "organisationName": "Demo Company",
  "status": "TRIAL"
}
```

- [ ] **Step 6: Commit**

```bash
git add services/tenant-service/src/main/java/com/andikisha/tenant/application/dto/response/TenantSlugResponse.java \
        services/tenant-service/src/main/java/com/andikisha/tenant/presentation/controller/PublicTenantController.java \
        services/tenant-service/src/main/java/com/andikisha/tenant/infrastructure/config/SecurityConfig.java \
        services/api-gateway/src/main/resources/application.yml
git commit -m "feat(tenant): public slug resolve endpoint + gateway route"
```

---

### Task 4: TenantCreatedEvent update + notification welcome email

**Files:**
- Modify: `shared/andikisha-events/src/main/java/com/andikisha/events/tenant/TenantCreatedEvent.java`
- Modify: `services/tenant-service/src/main/java/com/andikisha/tenant/infrastructure/messaging/RabbitTenantEventPublisher.java`
- Modify: `services/notification-service/src/main/java/com/andikisha/notification/application/listener/TenantEventListener.java`

- [ ] **Step 1: Add `workspaceSlug` to TenantCreatedEvent**

Replace the class body:

```java
package com.andikisha.events.tenant;

import com.andikisha.events.BaseEvent;

public class TenantCreatedEvent extends BaseEvent {

    private String tenantName;
    private String country;
    private String currency;
    private String plan;
    private String adminEmail;
    private String workspaceSlug;

    public TenantCreatedEvent(String tenantId, String tenantName,
                              String country, String currency, String plan,
                              String adminEmail, String workspaceSlug) {
        super("tenant.created", tenantId);
        this.tenantName = tenantName;
        this.country = country;
        this.currency = currency;
        this.plan = plan;
        this.adminEmail = adminEmail;
        this.workspaceSlug = workspaceSlug;
    }

    protected TenantCreatedEvent() { super(); }

    public String getTenantName()    { return tenantName; }
    public String getCountry()       { return country; }
    public String getCurrency()      { return currency; }
    public String getPlan()          { return plan; }
    public String getAdminEmail()    { return adminEmail; }
    public String getWorkspaceSlug() { return workspaceSlug; }
}
```

- [ ] **Step 2: Pass slug in RabbitTenantEventPublisher.publishTenantCreated()**

Update the `new TenantCreatedEvent(...)` constructor call to add `tenant.getWorkspaceSlug()` as the last argument:

```java
var event = new TenantCreatedEvent(
        tenant.getTenantId(),
        tenant.getCompanyName(),
        tenant.getCountry(),
        tenant.getCurrency(),
        tenant.getPlan().getName(),
        tenant.getAdminEmail(),
        tenant.getWorkspaceSlug()
);
```

- [ ] **Step 3: Update welcome email in TenantEventListener**

Replace `handleTenantCreated` body:

```java
private void handleTenantCreated(TenantCreatedEvent event) {
    String subject = "Welcome to AndikishaHR — your workspace is ready";
    String body = "Dear Admin,\n\n"
            + "Your organisation " + event.getTenantName()
            + " has been registered on AndikishaHR.\n\n"
            + "Sign in details:\n"
            + "  Login URL:  https://app.andikishahr.com/login\n"
            + "  Workspace:  " + event.getWorkspaceSlug() + "\n"
            + "  Email:      " + event.getAdminEmail() + "\n"
            + "  Password:   (provided by your Andikisha account manager)\n\n"
            + "Enter the workspace identifier above when you sign in for the first time.\n"
            + "You will be prompted to set a new password immediately after logging in.\n\n"
            + "Your trial period is 14 days. During this time you can:\n"
            + "- Add employees and departments\n"
            + "- Run your first payroll\n"
            + "- Configure leave policies\n"
            + "- Set up statutory registrations (KRA, NSSF, SHIF)\n\n"
            + "Need help getting started? Contact support@andikisha.co.ke";

    notificationService.sendNotification(
            event.getTenantId(),
            UUID.nameUUIDFromBytes(event.getAdminEmail().getBytes(StandardCharsets.UTF_8)),
            null, event.getAdminEmail(), null,
            NotificationChannel.EMAIL,
            "ONBOARDING", subject, body,
            NotificationPriority.HIGH,
            event.getEventId(), event.getEventType()
    );

    log.info("Welcome email queued for new tenant: {} (workspace: {})",
            event.getTenantName(), event.getWorkspaceSlug());
}
```

- [ ] **Step 4: Build shared/andikisha-events and dependent services**

```bash
cd shared/andikisha-events
../../gradlew publishToMavenLocal

cd ../../services/tenant-service
../gradlew compileJava -x compileTestJava

cd ../notification-service
../gradlew compileJava -x compileTestJava
```

Expected: all three BUILD SUCCESSFUL

- [ ] **Step 5: Commit**

```bash
git add shared/andikisha-events/src/main/java/com/andikisha/events/tenant/TenantCreatedEvent.java \
        services/tenant-service/src/main/java/com/andikisha/tenant/infrastructure/messaging/RabbitTenantEventPublisher.java \
        services/notification-service/src/main/java/com/andikisha/notification/application/listener/TenantEventListener.java
git commit -m "feat(tenant,notification): workspace slug in TenantCreatedEvent + welcome email"
```

---

### Task 5: Platform-portal — provision form workspace slug field + success modal

**Files:**
- Modify: `frontend/platform-portal/src/app/(platform)/tenants/new/page.tsx`

The provision form currently has: Organisation Name, Admin email, first/last name, phone, Plan, Billing cycle, Seat count, Price, Trial days.

- [ ] **Step 1: Add workspace slug state and auto-generation logic**

Add to state declarations (below `orgName` state):

```typescript
const [workspaceSlug, setWorkspaceSlug] = useState("");
const [slugEdited, setSlugEdited] = useState(false);

// Auto-generate slug from org name unless user has manually edited it
useEffect(() => {
  if (!slugEdited) {
    setWorkspaceSlug(toSlug(orgName));
  }
}, [orgName, slugEdited]);

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/, "")
    .slice(0, 50)
    .replace(/-+$/, "");
}
```

- [ ] **Step 2: Add workspace slug field in the Organisation section**

Add after the Organisation Name field:

```tsx
{/* Workspace Identifier */}
<div>
  <label className="block text-[13px] font-medium text-neutral-700 mb-1.5">
    Workspace Identifier
  </label>
  <div className="relative">
    <input
      type="text"
      value={workspaceSlug}
      onChange={(e) => {
        setSlugEdited(true);
        // Sanitise on input: lowercase + allow only a-z0-9 and -
        setWorkspaceSlug(
          e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/--+/g, "-")
        );
      }}
      placeholder="polca-creations-limited"
      maxLength={50}
      pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
      className="w-full border border-neutral-300 rounded-lg px-3.5 py-2.5 text-[13.5px] text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 font-mono"
    />
  </div>
  <p className="mt-1 text-[12px] text-neutral-500">
    Login URL: <span className="font-mono text-neutral-700">app.andikishahr.com/login?workspace={workspaceSlug || "..."}</span>
  </p>
</div>
```

- [ ] **Step 3: Include workspaceSlug in form submission body**

In the `handleSubmit` function, add `workspaceSlug` to the JSON body alongside the existing fields. The API accepts it as the optional `workspaceSlug` field in `CreateTenantWithLicenceRequest`.

- [ ] **Step 4: Update success modal to show workspace slug**

The success modal currently shows: licence key, admin email, temp password (with copy), seat count, trial end date.

Add a workspace identifier section at the top of the modal content, before the licence key:

```tsx
{/* Workspace identifier — primary thing the SUPER_ADMIN must communicate */}
<div className="mb-4 p-3 bg-brand-50 border border-brand-200 rounded-lg">
  <p className="text-[11px] font-semibold text-brand-900 uppercase tracking-wider mb-1">
    Workspace Identifier
  </p>
  <div className="flex items-center justify-between gap-2">
    <code className="text-[15px] font-mono font-semibold text-brand-950">
      {result.workspaceSlug}
    </code>
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(result.workspaceSlug);
        setCopiedSlug(true);
        setTimeout(() => setCopiedSlug(false), 2000);
      }}
      className="text-[11px] font-medium text-brand-800 hover:text-brand-900 border border-brand-300 rounded px-2 py-0.5 transition-colors"
    >
      {copiedSlug ? "Copied!" : "Copy"}
    </button>
  </div>
  <p className="mt-1 text-[11px] text-brand-700">
    Login URL:{" "}
    <span className="font-mono">
      app.andikishahr.com/login?workspace={result.workspaceSlug}
    </span>
  </p>
</div>
```

Add `copiedSlug` state alongside the existing `copiedPassword` state:
```typescript
const [copiedSlug, setCopiedSlug] = useState(false);
```

Also ensure `result` type includes `workspaceSlug: string`.

- [ ] **Step 5: Commit**

```bash
git add frontend/platform-portal/src/app/\(platform\)/tenants/new/page.tsx
git commit -m "feat(platform-portal): workspace slug field + login URL in provision form and success modal"
```

---

### Task 6: Platform-portal — tenant detail page: show workspace slug

**Files:**
- Modify: `frontend/platform-portal/src/app/(platform)/tenants/[tenantId]/page.tsx`

The API now returns `workspaceSlug` in `TenantDetailResponse`. The detail page needs to surface it in the identity strip.

- [ ] **Step 1: Add workspaceSlug to the TenantDetail TypeScript type**

Find the `TenantDetail` type (or interface) defined in the detail page. Add:
```typescript
workspaceSlug: string;
```

- [ ] **Step 2: Display workspace slug in the identity strip**

The identity strip currently shows: org name, status badge, tenantId (truncated), admin email.

Add workspace slug as a copyable badge below the tenant ID line:

```tsx
{/* Workspace slug */}
<div className="flex items-center gap-2 mt-1">
  <span className="text-[12px] text-neutral-500">Workspace:</span>
  <code className="text-[12px] font-mono text-neutral-800 bg-neutral-100 px-1.5 py-0.5 rounded">
    {tenant.workspaceSlug}
  </code>
  <button
    type="button"
    onClick={() => {
      navigator.clipboard.writeText(tenant.workspaceSlug);
      toast.success("Workspace slug copied");
    }}
    className="text-neutral-400 hover:text-neutral-600 transition-colors"
    aria-label="Copy workspace slug"
  >
    <Copy size={12} />
  </button>
</div>
```

- [ ] **Step 3: Compile check**

```bash
cd frontend/platform-portal
pnpm tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add frontend/platform-portal/src/app/\(platform\)/tenants/\[tenantId\]/page.tsx
git commit -m "feat(platform-portal): show workspace slug in tenant detail identity strip"
```

---

### Task 7: Tenant-portal login — workspace field + BFF resolution (Issue 2 fix)

**Files:**
- Modify: `frontend/tenant-portal/src/app/login/page.tsx`
- Modify: `frontend/tenant-portal/src/app/api/auth/login/route.ts`

This task removes the `TENANT_ID` env var dependency and makes login work for any tenant.

- [ ] **Step 1: Update the BFF login route**

Replace `frontend/tenant-portal/src/app/api/auth/login/route.ts` entirely:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";
const COOKIE_NAME = "tenant_token";

// Simple in-memory rate limiter (10 attempts per 15 minutes per IP)
const loginAttempts = new Map<string, { count: number; resetAt: number }>();
const MAX_ATTEMPTS = 10;
const WINDOW_MS = 15 * 60 * 1000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record || now > record.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  if (record.count >= MAX_ATTEMPTS) return true;
  record.count++;
  return false;
}

function extractRoles(token: string): Set<string> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3 || !parts[1]) return new Set();
    const padded = parts[1] + "=".repeat((4 - (parts[1].length % 4)) % 4);
    const json = Buffer.from(padded.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
    const payload = JSON.parse(json) as Record<string, unknown>;
    const rawRole = typeof payload.role === "string" ? payload.role : undefined;
    const rawRoles: string[] = Array.isArray(payload.roles)
      ? (payload.roles as string[]).filter((r): r is string => typeof r === "string")
      : rawRole
      ? [rawRole]
      : [];
    return new Set(rawRoles);
  } catch {
    return new Set();
  }
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "TOO_MANY_REQUESTS", message: "Too many login attempts. Try again in 15 minutes." },
      { status: 429 }
    );
  }

  const body = await request.json() as { workspace?: string; email?: string; password?: string };

  if (!body.workspace?.trim()) {
    return NextResponse.json(
      { error: "WORKSPACE_REQUIRED", message: "Workspace identifier is required." },
      { status: 400 }
    );
  }

  // Step 1: Resolve workspace slug → tenantId via the public endpoint
  const slug = body.workspace.trim().toLowerCase();
  let tenantId: string;
  try {
    const resolveRes = await fetch(
      `${GATEWAY}/api/v1/public/tenants/resolve?slug=${encodeURIComponent(slug)}`
    );
    if (resolveRes.status === 404) {
      return NextResponse.json(
        {
          error: "WORKSPACE_NOT_FOUND",
          message: `Workspace "${slug}" not found. Check the spelling or contact your administrator.`,
        },
        { status: 404 }
      );
    }
    if (resolveRes.status === 403) {
      return NextResponse.json(
        {
          error: "WORKSPACE_UNAVAILABLE",
          message: "This workspace is not available. Contact support@andikisha.co.ke.",
        },
        { status: 403 }
      );
    }
    if (!resolveRes.ok) {
      return NextResponse.json(
        { error: "RESOLVE_ERROR", message: "Unable to verify workspace. Please try again." },
        { status: 502 }
      );
    }
    const resolved = await resolveRes.json() as { tenantId?: string };
    if (!resolved.tenantId) {
      return NextResponse.json(
        { error: "RESOLVE_ERROR", message: "Unable to verify workspace. Please try again." },
        { status: 502 }
      );
    }
    tenantId = resolved.tenantId;
  } catch {
    return NextResponse.json(
      { error: "RESOLVE_ERROR", message: "Unable to reach authentication service. Please try again." },
      { status: 503 }
    );
  }

  // Step 2: Log in with the resolved tenantId
  const upstream = await fetch(`${GATEWAY}/api/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Tenant-ID": tenantId },
    body: JSON.stringify({ email: body.email, password: body.password }),
  });

  const data = await upstream.json();

  if (!upstream.ok) {
    return NextResponse.json(data, { status: upstream.status });
  }

  if (typeof data.accessToken !== "string" || !data.accessToken) {
    return NextResponse.json({ error: "Bad upstream response" }, { status: 502 });
  }

  // Reject SUPER_ADMIN at the tenant portal — they belong in the platform portal.
  if (extractRoles(data.accessToken).has("SUPER_ADMIN")) {
    return NextResponse.json(
      {
        error: "WRONG_PORTAL",
        message: "SUPER_ADMIN accounts use the Andikisha platform portal, not the tenant portal.",
        platformPortalUrl: process.env.NEXT_PUBLIC_PLATFORM_PORTAL_URL,
      },
      { status: 403 }
    );
  }

  const expiresIn =
    typeof data.expiresIn === "number" && data.expiresIn > 0
      ? data.expiresIn
      : 3600;

  const isProduction = process.env.NODE_ENV === "production";
  const jar = await cookies();
  jar.set(COOKIE_NAME, data.accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "strict",
    maxAge: expiresIn,
    path: "/",
  });

  return NextResponse.json({
    user: data.user,
    expiresIn,
  });
}
```

- [ ] **Step 2: Update the login page — add Workspace field**

In `frontend/tenant-portal/src/app/login/page.tsx`:

Add workspace to state:
```typescript
const searchParams = useSearchParams();
const returnTo = safeReturnTo(searchParams.get("returnTo"));
const workspaceParam = searchParams.get("workspace") ?? "";

const [workspace, setWorkspace] = useState(() => {
  // URL param pre-fills the field; if absent, fall back to localStorage
  if (workspaceParam) return workspaceParam;
  if (typeof window !== "undefined") {
    return localStorage.getItem("andikisha_last_workspace") ?? "";
  }
  return "";
});
```

Add to the `handleSubmit` request body:
```typescript
body: JSON.stringify({ workspace, email, password }),
```

After successful login, save workspace to localStorage:
```typescript
if (typeof window !== "undefined") {
  localStorage.setItem("andikisha_last_workspace", workspace);
}
router.replace(returnTo ?? findCorrectDashboard(roles));
```

Add the Workspace field to the form JSX, **above** the Email field:

```tsx
{/* Workspace */}
<div>
  <label className="block text-[13.5px] font-medium text-neutral-700 mb-1.5">
    Workspace
  </label>
  <input
    type="text"
    value={workspace}
    onChange={(e) => setWorkspace(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
    placeholder="your-workspace"
    required
    autoComplete="organization"
    autoFocus={!workspace}
    className="w-full border border-neutral-300 rounded-lg px-3.5 py-2.5 text-[14px] text-neutral-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 placeholder:text-neutral-400 font-mono transition-colors"
  />
  <p className="mt-1 text-[11.5px] text-neutral-400">
    Your workspace identifier — provided by Andikisha during account setup.
  </p>
</div>
```

Add workspace-specific error handling. The `LoginError` type already has `kind: "general"`, so new error codes from the BFF (`WORKSPACE_NOT_FOUND`, `WORKSPACE_UNAVAILABLE`) render via the general error message field — they are already returned with a human-readable `message`.

- [ ] **Step 3: Type-check**

```bash
cd frontend/tenant-portal
pnpm tsc --noEmit
```

Expected: no errors

- [ ] **Step 4: End-to-end smoke test**

1. Start all services
2. Navigate to tenant-portal login page
3. Enter workspace `demo`, email `admin@demo.co.ke`, temp password
4. Confirm: resolves demo tenant, login succeeds, lands on change-password page (mustChangePassword=true)
5. Enter workspace `nireen`, email `admin@nireen.com`, temp password from provisioning
6. Confirm: resolves nireen tenant, login succeeds, `must_change_password=true` redirects to `/my/change-password`
7. Enter workspace `doesnotexist`
8. Confirm: shows "Workspace 'doesnotexist' not found" error
9. Confirm: localStorage saves last workspace slug on success; pre-fills on next page load
10. Navigate to `/login?workspace=nireen` — confirm Workspace field is pre-filled with `nireen`

- [ ] **Step 5: Commit**

```bash
git add frontend/tenant-portal/src/app/login/page.tsx \
        frontend/tenant-portal/src/app/api/auth/login/route.ts
git commit -m "fix(tenant-portal): workspace-slug login — remove TENANT_ID dep, resolve slug before auth (fixes Issue 2)"
```

---

## Sequence Summary

| Task | Service | Risk |
|------|---------|------|
| 1 | tenant-service | Low — additive migration only |
| 2 | tenant-service | Low — slug generation + DTO additions |
| 3 | tenant-service + api-gateway | Low — new public endpoint, no existing auth changed |
| 4 | shared events + tenant + notification | Low — additive field, backward-compatible via Jackson |
| 5 | platform-portal | Low — UI only, existing API extended |
| 6 | platform-portal | Low — UI only |
| 7 | tenant-portal | **Medium** — changes the login flow; requires smoke test |

**Note on TENANT_ID env var:** After Task 7 ships, `TENANT_ID` is no longer read by the BFF. Existing `.env.local` files with this variable can be left in place (they'll simply be ignored) or cleaned up at next deploy cycle.
