# Superadmin Portal Plan 2 — Tenants Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the full Tenants section of the superadmin portal — tenant list page, provisioning form, and tenant detail page with Overview, Licence, and Feature Flags tabs — backed by 5 new backend endpoints.

**Architecture:** The frontend is Next.js 15 App Router with TanStack Query v5 and Tailwind CSS, proxying all API calls through `/api/proxy/[...path]` (HttpOnly JWT BFF). The backend lives in `tenant-service` with all new endpoints added to the existing `SuperAdminController` at `/api/v1/super-admin/**`. No new services, no new routes in api-gateway.

**Tech Stack:** Next.js 15 App Router · TanStack Query v5 · Tailwind CSS · Spring Boot 3.4 · Java 21 · JUnit 5 · MockMvc · Mockito

---

## File Structure

### Backend — `services/tenant-service/`

| Action | File |
|--------|------|
| Modify | `src/main/java/com/andikisha/tenant/domain/model/Tenant.java` |
| Create | `src/main/java/com/andikisha/tenant/application/dto/request/ExtendTrialRequest.java` |
| Modify | `src/main/java/com/andikisha/tenant/application/dto/response/TenantDetailResponse.java` |
| Modify | `src/main/java/com/andikisha/tenant/application/service/SuperAdminTenantService.java` |
| Modify | `src/main/java/com/andikisha/tenant/application/service/FeatureFlagService.java` |
| Modify | `src/main/java/com/andikisha/tenant/presentation/controller/SuperAdminController.java` |
| Create | `src/test/java/com/andikisha/tenant/e2e/SuperAdminControllerTest.java` |

### Frontend — `frontend/superadmin-portal/src/`

| Action | File |
|--------|------|
| Modify | `types/tenant.ts` |
| Modify | `app/layout.tsx` |
| Create | `components/ui/Toaster.tsx` |
| Modify | `app/(dashboard)/tenants/page.tsx` |
| Create | `app/(dashboard)/tenants/new/page.tsx` |
| Modify | `app/(dashboard)/tenants/[tenantId]/page.tsx` |
| Create | `components/tenants/detail/OverviewTab.tsx` |
| Create | `components/tenants/detail/LicenceTab.tsx` |
| Create | `components/tenants/detail/RenewModal.tsx` |
| Create | `components/tenants/detail/UpgradeModal.tsx` |
| Create | `components/tenants/detail/FeatureFlagsTab.tsx` |
| Create | `components/tenants/detail/TenantActionMenu.tsx` |
| Create | `components/tenants/detail/ConfirmModal.tsx` |
| Create | `components/tenants/detail/SuspendModal.tsx` |
| Create | `components/tenants/detail/ExtendTrialModal.tsx` |

---

## Task 1: Backend — extendTrial domain method + ExtendTrialRequest DTO (TDD)

**Files:**
- Create: `services/tenant-service/src/main/java/com/andikisha/tenant/application/dto/request/ExtendTrialRequest.java`
- Modify: `services/tenant-service/src/main/java/com/andikisha/tenant/domain/model/Tenant.java`
- Modify: `services/tenant-service/src/test/java/com/andikisha/tenant/unit/TenantServiceTest.java`

- [ ] **Step 1: Write failing unit test for extendTrial domain method**

Open `services/tenant-service/src/test/java/com/andikisha/tenant/unit/TenantServiceTest.java` and add this test class (add after any existing tests — do not remove existing tests):

```java
// At the top of the file, verify these imports exist or add them:
// import com.andikisha.tenant.domain.model.Tenant;
// import com.andikisha.tenant.domain.model.TenantStatus;
// import com.andikisha.common.exception.BusinessRuleException;
// import org.junit.jupiter.api.Test;
// import java.time.LocalDate;
// import static org.assertj.core.api.Assertions.*;

@Test
void extendTrial_addsDaysToTrialEndsAt() {
    Tenant tenant = buildTrialTenant();
    LocalDate original = tenant.getTrialEndsAt();

    tenant.extendTrial(14);

    assertThat(tenant.getTrialEndsAt()).isEqualTo(original.plusDays(14));
    assertThat(tenant.getStatus()).isEqualTo(TenantStatus.TRIAL);
}

@Test
void extendTrial_whenNotTrial_throwsBusinessRuleException() {
    Tenant tenant = buildTrialTenant();
    tenant.activate();

    assertThatThrownBy(() -> tenant.extendTrial(14))
            .isInstanceOf(BusinessRuleException.class)
            .hasMessageContaining("TRIAL");
}

private Tenant buildTrialTenant() {
    // Use reflection via the static factory — Plan and UUID are enough.
    // We cannot instantiate Plan directly without DB, so use a stub Plan.
    com.andikisha.tenant.domain.model.Plan plan = new com.andikisha.tenant.domain.model.Plan();
    // Plan has a no-arg protected constructor — use it here for test isolation.
    return Tenant.create("Acme Corp", "KE", "KES",
            "admin@acme.com", "+254700000000", plan);
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/lawrence-eq/Projects/andikisha && ./gradlew :services:tenant-service:test --tests "com.andikisha.tenant.unit.TenantServiceTest.extendTrial*" --info 2>&1 | tail -20
```

Expected: compilation failure — `extendTrial` method does not exist yet.

- [ ] **Step 3: Add `extendTrial` method to `Tenant.java`**

In `services/tenant-service/src/main/java/com/andikisha/tenant/domain/model/Tenant.java`, add after the `reactivate()` method (around line 107):

```java
public void extendTrial(int additionalDays) {
    if (this.status != TenantStatus.TRIAL) {
        throw new BusinessRuleException("INVALID_STATE",
                "Can only extend trial for tenants in TRIAL status");
    }
    LocalDate base = this.trialEndsAt != null ? this.trialEndsAt : LocalDate.now();
    this.trialEndsAt = base.plusDays(additionalDays);
}
```

- [ ] **Step 4: Create `ExtendTrialRequest.java`**

Create `services/tenant-service/src/main/java/com/andikisha/tenant/application/dto/request/ExtendTrialRequest.java`:

```java
package com.andikisha.tenant.application.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record ExtendTrialRequest(
        @Min(value = 1, message = "Additional days must be at least 1")
        @Max(value = 90, message = "Cannot extend trial by more than 90 days")
        int additionalDays
) {}
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
cd /Users/lawrence-eq/Projects/andikisha && ./gradlew :services:tenant-service:test --tests "com.andikisha.tenant.unit.TenantServiceTest.extendTrial*" --info 2>&1 | tail -20
```

Expected: `BUILD SUCCESSFUL`, 2 tests passed.

- [ ] **Step 6: Commit**

```bash
git add services/tenant-service/src/main/java/com/andikisha/tenant/domain/model/Tenant.java \
        services/tenant-service/src/main/java/com/andikisha/tenant/application/dto/request/ExtendTrialRequest.java \
        services/tenant-service/src/test/java/com/andikisha/tenant/unit/TenantServiceTest.java
git commit -m "feat(tenant): add Tenant.extendTrial domain method and ExtendTrialRequest DTO"
```

---

## Task 2: Backend — extendTrial + cancelTenant service methods + controller endpoints (TDD)

**Files:**
- Modify: `services/tenant-service/src/main/java/com/andikisha/tenant/application/service/SuperAdminTenantService.java`
- Modify: `services/tenant-service/src/main/java/com/andikisha/tenant/presentation/controller/SuperAdminController.java`
- Create: `services/tenant-service/src/test/java/com/andikisha/tenant/e2e/SuperAdminControllerTest.java`

- [ ] **Step 1: Write failing e2e tests for the new endpoints**

Create `services/tenant-service/src/test/java/com/andikisha/tenant/e2e/SuperAdminControllerTest.java`:

```java
package com.andikisha.tenant.e2e;

import com.andikisha.tenant.application.dto.response.TenantSummaryResponse;
import com.andikisha.tenant.application.service.FeatureFlagService;
import com.andikisha.tenant.application.service.LicencePlanService;
import com.andikisha.tenant.application.service.LicenceStateMachineService;
import com.andikisha.tenant.application.service.SuperAdminTenantService;
import com.andikisha.common.exception.BusinessRuleException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(com.andikisha.tenant.presentation.controller.SuperAdminController.class)
@Import({
    com.andikisha.tenant.infrastructure.config.SecurityConfig.class,
    com.andikisha.tenant.presentation.filter.TrustedHeaderAuthFilter.class,
    com.andikisha.common.exception.GlobalExceptionHandler.class,
    com.andikisha.tenant.presentation.advice.TenantExceptionHandler.class
})
class SuperAdminControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired ObjectMapper objectMapper;

    @MockitoBean JpaMetamodelMappingContext jpaMetamodelMappingContext;
    @MockitoBean SuperAdminTenantService superAdminTenantService;
    @MockitoBean LicencePlanService licencePlanService;
    @MockitoBean LicenceStateMachineService licenceStateMachineService;
    @MockitoBean FeatureFlagService featureFlagService;

    private static final UUID TENANT_ID = UUID.randomUUID();
    private static final String SA = "SUPER_ADMIN";

    // ── extend-trial ──────────────────────────────────────────────────────────

    @Test
    void extendTrial_missingBody_returns400() throws Exception {
        mockMvc.perform(patch("/api/v1/super-admin/tenants/{id}/extend-trial", TENANT_ID)
                        .header("X-User-ID", "system").header("X-User-Role", SA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void extendTrial_happyPath_returns200() throws Exception {
        TenantSummaryResponse summary = new TenantSummaryResponse(
                TENANT_ID, "Acme Corp", "TRIAL", "Starter",
                10, LocalDate.of(2026, 6, 30), "admin@acme.com", LocalDateTime.now());
        when(superAdminTenantService.extendTrial(eq(TENANT_ID), eq(14), any()))
                .thenReturn(summary);

        mockMvc.perform(patch("/api/v1/super-admin/tenants/{id}/extend-trial", TENANT_ID)
                        .header("X-User-ID", "system").header("X-User-Role", SA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"additionalDays\":14}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.organisationName").value("Acme Corp"));
    }

    @Test
    void extendTrial_nonTrialTenant_returns422() throws Exception {
        when(superAdminTenantService.extendTrial(eq(TENANT_ID), anyInt(), any()))
                .thenThrow(new BusinessRuleException("INVALID_STATE",
                        "Can only extend trial for tenants in TRIAL status"));

        mockMvc.perform(patch("/api/v1/super-admin/tenants/{id}/extend-trial", TENANT_ID)
                        .header("X-User-ID", "system").header("X-User-Role", SA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"additionalDays\":14}"))
                .andExpect(status().isUnprocessableEntity());
    }

    // ── cancel (soft-delete) ──────────────────────────────────────────────────

    @Test
    void cancelTenant_happyPath_returns204() throws Exception {
        mockMvc.perform(delete("/api/v1/super-admin/tenants/{id}", TENANT_ID)
                        .header("X-User-ID", "system").header("X-User-Role", SA))
                .andExpect(status().isNoContent());
    }

    @Test
    void cancelTenant_alreadyCancelled_returns422() throws Exception {
        doThrow(new BusinessRuleException("INVALID_STATE", "Tenant is already cancelled"))
                .when(superAdminTenantService).cancelTenant(eq(TENANT_ID), any());

        mockMvc.perform(delete("/api/v1/super-admin/tenants/{id}", TENANT_ID)
                        .header("X-User-ID", "system").header("X-User-Role", SA))
                .andExpect(status().isUnprocessableEntity());
    }

    // ── feature flags ─────────────────────────────────────────────────────────

    @Test
    void getTenantFeatureFlags_returns200() throws Exception {
        when(featureFlagService.getAllForTenantById(TENANT_ID.toString()))
                .thenReturn(List.of(
                        new com.andikisha.tenant.application.dto.response.FeatureFlagResponse(
                                "payroll.advanced", true, "Advanced payroll features")));

        mockMvc.perform(get("/api/v1/super-admin/tenants/{id}/feature-flags", TENANT_ID)
                        .header("X-User-ID", "system").header("X-User-Role", SA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].featureKey").value("payroll.advanced"))
                .andExpect(jsonPath("$[0].enabled").value(true));
    }

    @Test
    void enableTenantFeatureFlag_returns200() throws Exception {
        when(featureFlagService.enableForTenant(TENANT_ID.toString(), "payroll.advanced"))
                .thenReturn(new com.andikisha.tenant.application.dto.response.FeatureFlagResponse(
                        "payroll.advanced", true, null));

        mockMvc.perform(put("/api/v1/super-admin/tenants/{id}/feature-flags/payroll.advanced/enable", TENANT_ID)
                        .header("X-User-ID", "system").header("X-User-Role", SA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(true));
    }

    @Test
    void disableTenantFeatureFlag_returns200() throws Exception {
        when(featureFlagService.disableForTenant(TENANT_ID.toString(), "payroll.advanced"))
                .thenReturn(new com.andikisha.tenant.application.dto.response.FeatureFlagResponse(
                        "payroll.advanced", false, null));

        mockMvc.perform(put("/api/v1/super-admin/tenants/{id}/feature-flags/payroll.advanced/disable", TENANT_ID)
                        .header("X-User-ID", "system").header("X-User-Role", SA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.enabled").value(false));
    }
}
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
cd /Users/lawrence-eq/Projects/andikisha && ./gradlew :services:tenant-service:test --tests "com.andikisha.tenant.e2e.SuperAdminControllerTest" --info 2>&1 | tail -30
```

Expected: compilation failure — `extendTrial`, `cancelTenant`, `getAllForTenantById`, `enableForTenant`, `disableForTenant` do not exist yet.

- [ ] **Step 3: Add service methods to `SuperAdminTenantService.java`**

In `services/tenant-service/src/main/java/com/andikisha/tenant/application/service/SuperAdminTenantService.java`, add these two methods after `filterTenants()` (around line 193):

```java
@Transactional
public TenantSummaryResponse extendTrial(UUID tenantId, int additionalDays, String updatedBy) {
    Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new TenantNotFoundException(tenantId));
    tenant.extendTrial(additionalDays);
    Tenant saved = tenantRepository.save(tenant);
    LicenceResponse licence = safeGetCurrentLicence(saved.getTenantId());
    return toSummaryWithLicence(saved, licence);
}

@Transactional
public void cancelTenant(UUID tenantId, String updatedBy) {
    Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new TenantNotFoundException(tenantId));
    if (tenant.getStatus() == TenantStatus.CANCELLED) {
        throw new BusinessRuleException("INVALID_STATE", "Tenant is already cancelled");
    }
    tenant.cancel();
    tenantRepository.save(tenant);
    log.info("Tenant {} cancelled by {}", tenantId, updatedBy);
}
```

- [ ] **Step 4: Add service methods to `FeatureFlagService.java`**

In `services/tenant-service/src/main/java/com/andikisha/tenant/application/service/FeatureFlagService.java`, add these three methods after `disable()`:

```java
public List<FeatureFlagResponse> getAllForTenantById(String tenantId) {
    return repository.findByTenantId(tenantId).stream()
            .map(mapper::toResponse).toList();
}

@Transactional
public FeatureFlagResponse enableForTenant(String tenantId, String featureKey) {
    FeatureFlag flag = repository.findByTenantIdAndFeatureKey(tenantId, featureKey)
            .orElseGet(() -> FeatureFlag.create(tenantId, featureKey, false, null));
    flag.enable();
    return mapper.toResponse(repository.save(flag));
}

@Transactional
public FeatureFlagResponse disableForTenant(String tenantId, String featureKey) {
    FeatureFlag flag = repository.findByTenantIdAndFeatureKey(tenantId, featureKey)
            .orElseGet(() -> FeatureFlag.create(tenantId, featureKey, false, null));
    flag.disable();
    return mapper.toResponse(repository.save(flag));
}
```

- [ ] **Step 5: Add new endpoints to `SuperAdminController.java`**

In `services/tenant-service/src/main/java/com/andikisha/tenant/presentation/controller/SuperAdminController.java`:

a) Add `FeatureFlagService` to the constructor dependencies. Replace the existing constructor:

```java
private final FeatureFlagService featureFlagService;

public SuperAdminController(SuperAdminTenantService superAdminTenantService,
                            LicencePlanService licencePlanService,
                            LicenceStateMachineService stateMachine,
                            FeatureFlagService featureFlagService) {
    this.superAdminTenantService = superAdminTenantService;
    this.licencePlanService = licencePlanService;
    this.stateMachine = stateMachine;
    this.featureFlagService = featureFlagService;
}
```

Also add the field declaration after `stateMachine`:
```java
private final FeatureFlagService featureFlagService;
```

b) Add the import at the top:
```java
import com.andikisha.tenant.application.dto.request.ExtendTrialRequest;
import com.andikisha.tenant.application.service.FeatureFlagService;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PutMapping;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
```

c) Add these endpoints after `getExpiringLicences()`, before `currentUserId()`:

```java
@PatchMapping("/tenants/{tenantId}/extend-trial")
@Operation(summary = "Extend trial period for a TRIAL-status tenant")
public TenantSummaryResponse extendTrial(
        @PathVariable UUID tenantId,
        @Valid @RequestBody ExtendTrialRequest request) {
    return superAdminTenantService.extendTrial(tenantId, request.additionalDays(), currentUserId());
}

@DeleteMapping("/tenants/{tenantId}")
@ResponseStatus(HttpStatus.NO_CONTENT)
@Operation(summary = "Cancel (soft-delete) a tenant")
public void cancelTenant(@PathVariable UUID tenantId) {
    superAdminTenantService.cancelTenant(tenantId, currentUserId());
}

@GetMapping("/tenants/{tenantId}/feature-flags")
@Operation(summary = "Get all feature flags for a specific tenant")
public List<FeatureFlagResponse> getTenantFeatureFlags(@PathVariable UUID tenantId) {
    return featureFlagService.getAllForTenantById(tenantId.toString());
}

@PutMapping("/tenants/{tenantId}/feature-flags/{featureKey}/enable")
@Validated
@Operation(summary = "Enable a feature flag for a specific tenant")
public FeatureFlagResponse enableTenantFeatureFlag(
        @PathVariable UUID tenantId,
        @PathVariable @Size(max = 100)
        @Pattern(regexp = "[a-zA-Z0-9_.-]+",
                message = "featureKey may only contain letters, digits, underscores, dots, and hyphens")
        String featureKey) {
    return featureFlagService.enableForTenant(tenantId.toString(), featureKey);
}

@PutMapping("/tenants/{tenantId}/feature-flags/{featureKey}/disable")
@Validated
@Operation(summary = "Disable a feature flag for a specific tenant")
public FeatureFlagResponse disableTenantFeatureFlag(
        @PathVariable UUID tenantId,
        @PathVariable @Size(max = 100)
        @Pattern(regexp = "[a-zA-Z0-9_.-]+",
                message = "featureKey may only contain letters, digits, underscores, dots, and hyphens")
        String featureKey) {
    return featureFlagService.disableForTenant(tenantId.toString(), featureKey);
}
```

Also add these missing imports to `SuperAdminController.java`:
```java
import com.andikisha.tenant.application.dto.response.FeatureFlagResponse;
import com.andikisha.tenant.application.dto.response.TenantSummaryResponse;
```

- [ ] **Step 6: Run the e2e tests to verify they pass**

```bash
cd /Users/lawrence-eq/Projects/andikisha && ./gradlew :services:tenant-service:test --tests "com.andikisha.tenant.e2e.SuperAdminControllerTest" --info 2>&1 | tail -30
```

Expected: `BUILD SUCCESSFUL`, 8 tests passed.

- [ ] **Step 7: Run all tenant-service tests to verify no regressions**

```bash
cd /Users/lawrence-eq/Projects/andikisha && ./gradlew :services:tenant-service:test 2>&1 | tail -20
```

Expected: `BUILD SUCCESSFUL`.

- [ ] **Step 8: Commit**

```bash
git add services/tenant-service/src/main/java/com/andikisha/tenant/application/service/SuperAdminTenantService.java \
        services/tenant-service/src/main/java/com/andikisha/tenant/application/service/FeatureFlagService.java \
        services/tenant-service/src/main/java/com/andikisha/tenant/presentation/controller/SuperAdminController.java \
        services/tenant-service/src/test/java/com/andikisha/tenant/e2e/SuperAdminControllerTest.java
git commit -m "feat(tenant): add extend-trial, soft-delete, and super-admin feature flag endpoints"
```

---

## Task 3: Backend — Enrich TenantDetailResponse (TDD)

**Files:**
- Modify: `services/tenant-service/src/main/java/com/andikisha/tenant/application/dto/response/TenantDetailResponse.java`
- Modify: `services/tenant-service/src/main/java/com/andikisha/tenant/application/service/SuperAdminTenantService.java`
- Modify: `services/tenant-service/src/test/java/com/andikisha/tenant/e2e/SuperAdminControllerTest.java`

The current `TenantDetailResponse` is missing statutory numbers, admin contact, and pay schedule. The Overview tab needs these fields.

- [ ] **Step 1: Write a failing test for enriched detail response**

In `SuperAdminControllerTest.java`, add this test:

```java
@Test
void getTenantDetail_returns200WithEnrichedFields() throws Exception {
    com.andikisha.tenant.application.dto.response.TenantDetailResponse detail =
            new com.andikisha.tenant.application.dto.response.TenantDetailResponse(
                    TENANT_ID, "Acme Corp", "ACTIVE",
                    LocalDateTime.of(2026, 1, 15, 10, 0),
                    "admin@acme.com", "+254700000001",
                    "P051234567A", "6000001", "SH/001/001",
                    "MONTHLY", 28, null, null, null);

    when(superAdminTenantService.getTenantDetail(TENANT_ID)).thenReturn(detail);

    mockMvc.perform(get("/api/v1/super-admin/tenants/{id}", TENANT_ID)
                    .header("X-User-ID", "system").header("X-User-Role", SA))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.adminEmail").value("admin@acme.com"))
            .andExpect(jsonPath("$.kraPin").value("P051234567A"))
            .andExpect(jsonPath("$.payDay").value(28));
}
```

- [ ] **Step 2: Run test to verify it fails**

```bash
cd /Users/lawrence-eq/Projects/andikisha && ./gradlew :services:tenant-service:test --tests "com.andikisha.tenant.e2e.SuperAdminControllerTest.getTenantDetail_returns200WithEnrichedFields" --info 2>&1 | tail -20
```

Expected: compilation failure — the new `TenantDetailResponse` constructor doesn't exist yet.

- [ ] **Step 3: Replace `TenantDetailResponse.java` with enriched version**

Replace the entire file at `services/tenant-service/src/main/java/com/andikisha/tenant/application/dto/response/TenantDetailResponse.java`:

```java
package com.andikisha.tenant.application.dto.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record TenantDetailResponse(
        UUID tenantId,
        String organisationName,
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

- [ ] **Step 4: Update `getTenantDetail()` in `SuperAdminTenantService.java`**

Replace the existing `getTenantDetail()` method (currently at lines ~149–158):

```java
public TenantDetailResponse getTenantDetail(UUID tenantId) {
    Tenant tenant = tenantRepository.findById(tenantId)
            .orElseThrow(() -> new TenantNotFoundException(tenantId));
    LicenceResponse currentLicence = safeGetCurrentLicence(tenant.getTenantId());
    return new TenantDetailResponse(
            tenant.getId(),
            tenant.getCompanyName(),
            tenant.getStatus().name(),
            tenant.getCreatedAt(),
            tenant.getAdminEmail(),
            tenant.getAdminPhone(),
            tenant.getKraPin(),
            tenant.getNssfNumber(),
            tenant.getShifNumber(),
            tenant.getPayFrequency(),
            tenant.getPayDay(),
            tenant.getSuspensionReason(),
            tenant.getTrialEndsAt(),
            currentLicence);
}
```

- [ ] **Step 5: Run all tests to verify pass and no regressions**

```bash
cd /Users/lawrence-eq/Projects/andikisha && ./gradlew :services:tenant-service:test 2>&1 | tail -20
```

Expected: `BUILD SUCCESSFUL`.

- [ ] **Step 6: Commit**

```bash
git add services/tenant-service/src/main/java/com/andikisha/tenant/application/dto/response/TenantDetailResponse.java \
        services/tenant-service/src/main/java/com/andikisha/tenant/application/service/SuperAdminTenantService.java \
        services/tenant-service/src/test/java/com/andikisha/tenant/e2e/SuperAdminControllerTest.java
git commit -m "feat(tenant): enrich TenantDetailResponse with statutory numbers, contact, and pay schedule"
```

---

## Task 4: Frontend — Extend types and add Toast provider

**Files:**
- Modify: `frontend/superadmin-portal/src/types/tenant.ts`
- Create: `frontend/superadmin-portal/src/components/ui/Toaster.tsx`
- Modify: `frontend/superadmin-portal/src/app/layout.tsx`

- [ ] **Step 1: Replace `types/tenant.ts` with the extended version**

Replace the entire file at `frontend/superadmin-portal/src/types/tenant.ts`:

```typescript
export type TenantStatus = "TRIAL" | "ACTIVE" | "SUSPENDED" | "CANCELLED" | "DELETED";
export type LicenceStatus = "TRIAL" | "ACTIVE" | "SUSPENDED" | "EXPIRED" | "CANCELLED";
export type BillingCycle = "MONTHLY" | "ANNUAL";

export interface TenantSummary {
  tenantId: string;
  organisationName: string;
  status: TenantStatus;
  planName: string;
  seatCount: number | null;
  endDate: string | null;
  adminEmail: string;
  createdAt: string;
}

export interface TenantDetail {
  tenantId: string;
  organisationName: string;
  status: TenantStatus;
  createdAt: string;
  adminEmail: string;
  adminPhone: string;
  kraPin: string | null;
  nssfNumber: string | null;
  shifNumber: string | null;
  payFrequency: string;
  payDay: number;
  suspensionReason: string | null;
  trialEndsAt: string | null;
  currentLicence: LicenceDetail | null;
}

export interface LicenceDetail {
  licenceId: string;
  tenantId: string;
  planId: string;
  planName: string;
  licenceKey: string;
  billingCycle: BillingCycle;
  seatCount: number;
  agreedPriceKes: number;
  currency: string;
  startDate: string;
  endDate: string | null;
  status: LicenceStatus;
  suspendedAt: string | null;
  createdBy: string;
}

export interface LicenceHistory {
  id: string;
  tenantId: string;
  licenceId: string;
  previousStatus: LicenceStatus;
  newStatus: LicenceStatus;
  changedBy: string;
  changeReason: string | null;
  changedAt: string;
}

export interface FeatureFlag {
  featureKey: string;
  enabled: boolean;
  description: string | null;
}

export interface Plan {
  id: string;
  name: string;
  tier: string;
  monthlyPrice: number;
  currency: string;
  maxEmployees: number;
  maxAdmins: number;
  payrollEnabled: boolean;
  leaveEnabled: boolean;
  attendanceEnabled: boolean;
  documentsEnabled: boolean;
  analyticsEnabled: boolean;
}

export interface ProvisionedTenant {
  tenantId: string;
  organisationName: string;
  licenceKey: string;
  licenceStatus: LicenceStatus;
  planName: string;
  adminEmail: string;
  temporaryPassword: string;
  seatCount: number;
  endDate: string | null;
}

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}
```

- [ ] **Step 2: Create `components/ui/Toaster.tsx`**

Create `frontend/superadmin-portal/src/components/ui/Toaster.tsx`:

```tsx
"use client";

import {
  createContext, useContext, useState, useCallback,
  type ReactNode,
} from "react";
import { CheckCircle, XCircle, AlertTriangle, X } from "lucide-react";

type Variant = "success" | "error" | "warning";

interface ToastItem {
  id: string;
  message: string;
  variant: Variant;
}

interface ToastCtx {
  toast: (message: string, variant?: Variant) => void;
}

const ToastContext = createContext<ToastCtx>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext).toast;
}

const ICON: Record<Variant, ReactNode> = {
  success: <CheckCircle size={16} className="text-[#27A870]" />,
  error:   <XCircle    size={16} className="text-red-500" />,
  warning: <AlertTriangle size={16} className="text-[#E8A020]" />,
};

const BORDER: Record<Variant, string> = {
  success: "border-l-[#27A870]",
  error:   "border-l-red-500",
  warning: "border-l-[#E8A020]",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, variant: Variant = "success") => {
    const id = crypto.randomUUID();
    setToasts(prev => [...prev, { id, message, variant }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const dismiss = (id: string) =>
    setToasts(prev => prev.filter(t => t.id !== id));

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 w-[340px] pointer-events-none">
        {toasts.map(t => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3 rounded-xl bg-white shadow-lg border border-gray-100 border-l-4 ${BORDER[t.variant]} animate-in slide-in-from-right-4 duration-200`}
          >
            <span className="mt-0.5 flex-shrink-0">{ICON[t.variant]}</span>
            <p className="flex-1 text-[13px] font-medium text-[#02110C]">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              aria-label="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
```

- [ ] **Step 3: Wrap app with ToastProvider in `app/layout.tsx`**

Replace `frontend/superadmin-portal/src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import { Montserrat, DM_Mono } from "next/font/google";
import { QueryProvider } from "@/components/layout/QueryProvider";
import { ToastProvider } from "@/components/ui/Toaster";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-dm-mono",
  weight: ["400", "500"],
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "AndikishaHR Super Admin", template: "%s | Super Admin" },
  description: "AndikishaHR platform administration portal",
  icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${montserrat.variable} ${dmMono.variable}`}>
      <body className="font-body antialiased">
        <QueryProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Run TypeScript type-check**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/superadmin-portal && pnpm tsc --noEmit 2>&1 | head -40
```

Expected: 0 errors.

- [ ] **Step 5: Commit**

```bash
git add frontend/superadmin-portal/src/types/tenant.ts \
        frontend/superadmin-portal/src/components/ui/Toaster.tsx \
        frontend/superadmin-portal/src/app/layout.tsx
git commit -m "feat(superadmin): extend tenant types, add Toast provider"
```

---

## Task 5: Frontend — Full Tenants List Page

**Files:**
- Modify: `frontend/superadmin-portal/src/app/(dashboard)/tenants/page.tsx`

This replaces the current stub with a fully functional list page. It reuses the existing `TenantTable` component (already has skeleton loading, pagination, row click navigation, and action buttons).

- [ ] **Step 1: Replace `app/(dashboard)/tenants/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/PageHeader";
import { TenantTable } from "@/components/dashboard/TenantTable";
import type { PagedResponse, TenantSummary, TenantStatus } from "@/types/tenant";

const STATUS_TABS: { label: string; value: TenantStatus | "ALL" }[] = [
  { label: "All",       value: "ALL" },
  { label: "Active",    value: "ACTIVE" },
  { label: "Trial",     value: "TRIAL" },
  { label: "Suspended", value: "SUSPENDED" },
  { label: "Cancelled", value: "CANCELLED" },
];

function QueryError({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
      <AlertTriangle size={15} className="flex-shrink-0" />
      {message}
    </div>
  );
}

export default function TenantsPage() {
  const [statusFilter, setStatusFilter] = useState<TenantStatus | "ALL">("ALL");
  const [page, setPage] = useState(0);

  const { data, isLoading, isError } = useQuery<PagedResponse<TenantSummary>>({
    queryKey: ["tenants-list", statusFilter, page],
    queryFn: () =>
      apiClient
        .get("/api/v1/super-admin/tenants", {
          params: {
            ...(statusFilter !== "ALL" ? { status: statusFilter } : {}),
            page,
            size: 25,
            sort: "createdAt,desc",
          },
        })
        .then((r) => r.data),
  });

  function handleStatusChange(status: TenantStatus | "ALL") {
    setStatusFilter(status);
    setPage(0);
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="Tenants"
        subtitle={`${data?.totalElements ?? "…"} total tenants across all plans`}
        actions={
          <a
            href="/tenants/new"
            className="flex items-center gap-1.5 bg-[#E8A020] hover:bg-[#C98510] text-[#02110C] font-bold text-[13.5px] h-9 px-3.5 rounded-lg transition-colors"
          >
            + New Tenant
          </a>
        }
      />

      <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">
        {/* Status filter tabs */}
        <div className="flex items-center gap-1 border-b border-gray-200">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => handleStatusChange(tab.value)}
              className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors -mb-px ${
                statusFilter === tab.value
                  ? "border-[#0B3D2E] text-[#0B3D2E]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isError ? (
          <QueryError message="Could not load tenants. Check the tenant-service connection." />
        ) : (
          <TenantTable
            tenants={data?.content ?? []}
            total={data?.totalElements ?? 0}
            page={page}
            pageSize={25}
            onPageChange={setPage}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/superadmin-portal && pnpm tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/superadmin-portal/src/app/\(dashboard\)/tenants/page.tsx
git commit -m "feat(superadmin): implement full tenants list page with status filter tabs"
```

---

## Task 6: Frontend — New Tenant Provisioning Page

**Files:**
- Create: `frontend/superadmin-portal/src/app/(dashboard)/tenants/new/page.tsx`

- [ ] **Step 1: Create `app/(dashboard)/tenants/new/page.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, Eye, EyeOff, Copy, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/PageHeader";
import { useToast } from "@/components/ui/Toaster";
import type { Plan, ProvisionedTenant } from "@/types/tenant";

interface ProvisionForm {
  organisationName: string;
  adminEmail: string;
  adminFirstName: string;
  adminLastName: string;
  adminPhone: string;
  planId: string;
  billingCycle: "MONTHLY" | "ANNUAL";
  seatCount: number;
  agreedPriceKes: number;
  trialDays: number;
}

const EMPTY: ProvisionForm = {
  organisationName: "",
  adminEmail: "",
  adminFirstName: "",
  adminLastName: "",
  adminPhone: "+254",
  planId: "",
  billingCycle: "MONTHLY",
  seatCount: 10,
  agreedPriceKes: 0,
  trialDays: 14,
};

function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const INPUT =
  "w-full border border-gray-200 rounded-lg px-3 py-2 text-[13.5px] text-[#02110C] focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E] placeholder:text-gray-300";

export default function NewTenantPage() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<ProvisionForm>(EMPTY);
  const [result, setResult] = useState<ProvisionedTenant | null>(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: () => apiClient.get("/api/v1/plans").then((r) => r.data),
  });

  const provision = useMutation({
    mutationFn: (data: ProvisionForm) =>
      apiClient.post<ProvisionedTenant>("/api/v1/super-admin/tenants", data).then((r) => r.data),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["tenants-list"] });
      toast("Tenant provisioned successfully", "success");
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Failed to provision tenant";
      toast(msg, "error");
    },
  });

  function set<K extends keyof ProvisionForm>(key: K, value: ProvisionForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function copyPassword() {
    if (result) {
      navigator.clipboard.writeText(result.temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (result) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <PageHeader title="Tenant Provisioned" subtitle="Credentials for the new tenant admin" />
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-lg mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-[#D1F5E6] flex items-center justify-center mb-4">
              <CheckCircle2 size={24} className="text-[#27A870]" />
            </div>
            <h2 className="text-[18px] font-bold text-[#02110C] mb-1">{result.organisationName}</h2>
            <p className="text-[13px] text-gray-500 mb-6">Provisioned on {result.planName} plan · {result.seatCount} seats</p>
            <div className="space-y-3">
              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Admin Email</p>
                <p className="text-[13.5px] font-medium text-[#02110C]">{result.adminEmail}</p>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Temporary Password</p>
                <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2">
                  <code className="flex-1 text-[13px] font-mono text-[#02110C]">
                    {passwordVisible ? result.temporaryPassword : "•".repeat(result.temporaryPassword.length)}
                  </code>
                  <button onClick={() => setPasswordVisible(!passwordVisible)} className="text-gray-400 hover:text-gray-600">
                    {passwordVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                  <button onClick={copyPassword} className="text-gray-400 hover:text-[#27A870] transition-colors">
                    {copied ? <CheckCircle2 size={14} className="text-[#27A870]" /> : <Copy size={14} />}
                  </button>
                </div>
                <p className="mt-1.5 text-[11.5px] text-amber-600">Share this password securely. It cannot be retrieved again.</p>
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => router.push(`/tenants/${result.tenantId}`)}
                className="flex-1 bg-[#0B3D2E] hover:bg-[#0a3328] text-white font-semibold text-[13.5px] h-10 rounded-lg transition-colors"
              >
                View Tenant
              </button>
              <button
                onClick={() => router.push("/tenants")}
                className="flex-1 border border-gray-200 text-gray-600 font-semibold text-[13.5px] h-10 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back to Tenants
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title="New Tenant"
        subtitle="Provision a new tenant and generate admin credentials"
        actions={
          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 border border-gray-200 text-gray-600 font-semibold text-[13.5px] h-9 px-3.5 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft size={14} /> Back
          </button>
        }
      />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              provision.mutate(form);
            }}
            className="space-y-6"
          >
            <section>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#166A50] mb-4">Organisation</p>
              <Field label="Organisation Name" required>
                <input
                  value={form.organisationName}
                  onChange={(e) => set("organisationName", e.target.value)}
                  placeholder="Acme Kenya Ltd"
                  required
                  maxLength={200}
                  className={INPUT}
                />
              </Field>
            </section>

            <section>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#166A50] mb-4">Admin Contact</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="First Name" required>
                  <input value={form.adminFirstName} onChange={(e) => set("adminFirstName", e.target.value)}
                    required maxLength={100} className={INPUT} placeholder="Jane" />
                </Field>
                <Field label="Last Name" required>
                  <input value={form.adminLastName} onChange={(e) => set("adminLastName", e.target.value)}
                    required maxLength={100} className={INPUT} placeholder="Wanjiru" />
                </Field>
                <Field label="Admin Email" required>
                  <input type="email" value={form.adminEmail} onChange={(e) => set("adminEmail", e.target.value)}
                    required className={INPUT} placeholder="admin@acme.co.ke" />
                </Field>
                <Field label="Admin Phone" required>
                  <input value={form.adminPhone} onChange={(e) => set("adminPhone", e.target.value)}
                    required pattern="^(\+254|0)7\d{8}$" className={INPUT} placeholder="+254712345678" />
                </Field>
              </div>
            </section>

            <section>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#166A50] mb-4">Licence</p>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Plan" required>
                  <select value={form.planId} onChange={(e) => set("planId", e.target.value)}
                    required className={INPUT}>
                    <option value="">Select plan…</option>
                    {plans.map((p) => (
                      <option key={p.id} value={p.id}>{p.name} — KES {p.monthlyPrice.toLocaleString()}/mo</option>
                    ))}
                  </select>
                </Field>
                <Field label="Billing Cycle" required>
                  <select value={form.billingCycle} onChange={(e) => set("billingCycle", e.target.value as "MONTHLY" | "ANNUAL")}
                    className={INPUT}>
                    <option value="MONTHLY">Monthly</option>
                    <option value="ANNUAL">Annual</option>
                  </select>
                </Field>
                <Field label="Seat Count" required>
                  <input type="number" min={1} value={form.seatCount}
                    onChange={(e) => set("seatCount", Number(e.target.value))} required className={INPUT} />
                </Field>
                <Field label="Agreed Price (KES)" required>
                  <input type="number" min={0} step="0.01" value={form.agreedPriceKes}
                    onChange={(e) => set("agreedPriceKes", Number(e.target.value))} required className={INPUT} />
                </Field>
                <Field label="Trial Days">
                  <input type="number" min={0} max={90} value={form.trialDays}
                    onChange={(e) => set("trialDays", Number(e.target.value))} className={INPUT} />
                </Field>
              </div>
            </section>

            <button
              type="submit"
              disabled={provision.isPending}
              className="w-full bg-[#E8A020] hover:bg-[#C98510] disabled:opacity-50 text-[#02110C] font-bold text-[13.5px] h-10 rounded-lg transition-colors"
            >
              {provision.isPending ? "Provisioning…" : "Provision Tenant"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/superadmin-portal && pnpm tsc --noEmit 2>&1 | head -20
```

Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add frontend/superadmin-portal/src/app/\(dashboard\)/tenants/new/page.tsx
git commit -m "feat(superadmin): add new tenant provisioning page with credentials reveal"
```

---

## Task 7: Frontend — Tenant Detail Shell + Overview Tab

**Files:**
- Modify: `frontend/superadmin-portal/src/app/(dashboard)/tenants/[tenantId]/page.tsx`
- Create: `frontend/superadmin-portal/src/components/tenants/detail/OverviewTab.tsx`

- [ ] **Step 1: Create `OverviewTab.tsx`**

Create `frontend/superadmin-portal/src/components/tenants/detail/OverviewTab.tsx`:

```tsx
import type { TenantDetail } from "@/types/tenant";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4 py-3 border-b border-gray-50 last:border-0">
      <p className="w-44 flex-shrink-0 text-[12px] font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="flex-1 text-[13.5px] text-[#02110C]">{value ?? <span className="text-gray-400">—</span>}</p>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="text-[13px] font-bold text-[#02110C]">{title}</p>
      </div>
      <div className="px-6 py-1">{children}</div>
    </div>
  );
}

interface Props {
  tenant: TenantDetail;
}

export function OverviewTab({ tenant }: Props) {
  const since = new Date(tenant.createdAt).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="grid grid-cols-2 gap-5">
      <Section title="Organisation">
        <Row label="Name"         value={tenant.organisationName} />
        <Row label="Status"       value={<StatusPill status={tenant.status} />} />
        <Row label="Member since" value={since} />
        {tenant.suspensionReason && (
          <Row label="Suspension reason" value={
            <span className="text-red-600">{tenant.suspensionReason}</span>
          } />
        )}
        {tenant.trialEndsAt && (
          <Row label="Trial ends" value={
            new Date(tenant.trialEndsAt).toLocaleDateString("en-GB", {
              day: "numeric", month: "short", year: "numeric",
            })
          } />
        )}
      </Section>

      <Section title="Admin Contact">
        <Row label="Email" value={
          <a href={`mailto:${tenant.adminEmail}`} className="text-[#166A50] hover:underline">
            {tenant.adminEmail}
          </a>
        } />
        <Row label="Phone" value={tenant.adminPhone} />
      </Section>

      <Section title="Statutory Registrations">
        <Row label="KRA PIN"      value={tenant.kraPin} />
        <Row label="NSSF Number"  value={tenant.nssfNumber} />
        <Row label="SHIF Number"  value={tenant.shifNumber} />
      </Section>

      <Section title="Pay Schedule">
        <Row label="Frequency" value={
          tenant.payFrequency.charAt(0) + tenant.payFrequency.slice(1).toLowerCase()
        } />
        <Row label="Pay Day"   value={`Day ${tenant.payDay} of month`} />
      </Section>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    ACTIVE:    "bg-[#D1F5E6] text-[#0F5040]",
    TRIAL:     "bg-[#E8F5F0] text-[#166A50] border border-[#D1F5E6]",
    SUSPENDED: "bg-[#FEE2E2] text-[#991B1B]",
    CANCELLED: "bg-gray-100 text-gray-500",
    DELETED:   "bg-gray-100 text-gray-400",
  };
  return (
    <span className={`inline-flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${styles[status] ?? "bg-gray-100 text-gray-500"}`}>
      <span className="w-[5px] h-[5px] rounded-full bg-current" />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}
```

- [ ] **Step 2: Replace `app/(dashboard)/tenants/[tenantId]/page.tsx` with the full detail shell**

```tsx
"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/PageHeader";
import { OverviewTab } from "@/components/tenants/detail/OverviewTab";
import { LicenceTab } from "@/components/tenants/detail/LicenceTab";
import { FeatureFlagsTab } from "@/components/tenants/detail/FeatureFlagsTab";
import { TenantActionMenu } from "@/components/tenants/detail/TenantActionMenu";
import type { TenantDetail } from "@/types/tenant";

type Tab = "overview" | "onboarding" | "employees" | "licence" | "flags" | "audit";

const TABS: { id: Tab; label: string }[] = [
  { id: "overview",   label: "Overview" },
  { id: "onboarding", label: "Onboarding" },
  { id: "employees",  label: "Employees" },
  { id: "licence",    label: "Licence" },
  { id: "flags",      label: "Feature Flags" },
  { id: "audit",      label: "Audit" },
];

function Placeholder({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center h-48 border border-dashed border-gray-200 rounded-xl">
      <p className="text-[13px] text-gray-400">{label} — coming in Phase 2</p>
    </div>
  );
}

interface Props {
  params: Promise<{ tenantId: string }>;
}

export default function TenantDetailPage({ params }: Props) {
  const { tenantId } = use(params);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const { data: tenant, isLoading, isError } = useQuery<TenantDetail>({
    queryKey: ["tenant-detail", tenantId],
    queryFn: () =>
      apiClient.get(`/api/v1/super-admin/tenants/${tenantId}`).then((r) => r.data),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <PageHeader title="Loading…" subtitle="" />
        <div className="flex-1 px-8 py-6">
          <div className="max-w-5xl mx-auto space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !tenant) {
    return (
      <div className="flex flex-col h-full overflow-hidden">
        <PageHeader title="Tenant not found" subtitle="" />
        <div className="flex-1 px-8 py-6">
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
            <AlertTriangle size={15} />
            Could not load tenant details. The tenant may not exist.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader
        title={tenant.organisationName}
        subtitle={`ID: ${tenantId} · ${tenant.adminEmail}`}
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push("/tenants")}
              className="flex items-center gap-1.5 border border-gray-200 text-gray-600 font-semibold text-[13.5px] h-9 px-3.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft size={14} /> Tenants
            </button>
            <TenantActionMenu tenantId={tenantId} status={tenant.status} />
          </div>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-gray-200 px-8 flex-shrink-0 bg-white">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-3 text-[13px] font-semibold border-b-2 transition-colors -mb-px ${
              activeTab === tab.id
                ? "border-[#0B3D2E] text-[#0B3D2E]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-5xl mx-auto">
          {activeTab === "overview"   && <OverviewTab tenant={tenant} />}
          {activeTab === "onboarding" && <Placeholder label="Onboarding checklist" />}
          {activeTab === "employees"  && <Placeholder label="Employee roster" />}
          {activeTab === "licence"    && <LicenceTab tenantId={tenantId} licence={tenant.currentLicence} />}
          {activeTab === "flags"      && <FeatureFlagsTab tenantId={tenantId} />}
          {activeTab === "audit"      && <Placeholder label="Audit trail" />}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: TypeScript check**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/superadmin-portal && pnpm tsc --noEmit 2>&1 | head -20
```

Expected: errors for missing `LicenceTab`, `FeatureFlagsTab`, `TenantActionMenu` — those are created in the next two tasks. This is expected — do not fix yet.

- [ ] **Step 4: Commit the Overview tab and shell (stubs for the missing components will fix errors)**

Note: Do NOT run the typecheck as the passing criterion yet — the missing components from Tasks 8 and 9 will resolve those errors. Add a note and skip this commit step. Proceed directly to Task 8.

---

## Task 8: Frontend — Licence Tab

**Files:**
- Create: `frontend/superadmin-portal/src/components/tenants/detail/LicenceTab.tsx`
- Create: `frontend/superadmin-portal/src/components/tenants/detail/RenewModal.tsx`
- Create: `frontend/superadmin-portal/src/components/tenants/detail/UpgradeModal.tsx`

- [ ] **Step 1: Create `RenewModal.tsx`**

Create `frontend/superadmin-portal/src/components/tenants/detail/RenewModal.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toaster";
import type { Plan } from "@/types/tenant";

interface Props {
  tenantId: string;
  currentPlanId: string;
  onClose: () => void;
}

const INPUT = "w-full border border-gray-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E]";

export function RenewModal({ tenantId, currentPlanId, onClose }: Props) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [planId, setPlanId] = useState(currentPlanId);
  const [billingCycle, setBillingCycle] = useState<"MONTHLY" | "ANNUAL">("MONTHLY");
  const [seatCount, setSeatCount] = useState(10);
  const [agreedPriceKes, setAgreedPriceKes] = useState(0);
  const [newEndDate, setNewEndDate] = useState(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() + 1);
    return d.toISOString().split("T")[0];
  });

  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: () => apiClient.get("/api/v1/plans").then((r) => r.data),
  });

  const renew = useMutation({
    mutationFn: () =>
      apiClient.post(`/api/v1/super-admin/tenants/${tenantId}/licences/renew`, {
        planId, billingCycle, seatCount, agreedPriceKes, newEndDate,
      }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-detail", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["licence-history", tenantId] });
      toast("Licence renewed", "success");
      onClose();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Renewal failed";
      toast(msg, "error");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-[480px] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-bold text-[#02110C]">Renew Licence</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Plan</label>
            <select value={planId} onChange={(e) => setPlanId(e.target.value)} className={INPUT}>
              {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Billing Cycle</label>
              <select value={billingCycle} onChange={(e) => setBillingCycle(e.target.value as "MONTHLY" | "ANNUAL")} className={INPUT}>
                <option value="MONTHLY">Monthly</option>
                <option value="ANNUAL">Annual</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Seats</label>
              <input type="number" min={1} value={seatCount} onChange={(e) => setSeatCount(Number(e.target.value))} className={INPUT} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Agreed Price (KES)</label>
              <input type="number" min={0} step="0.01" value={agreedPriceKes} onChange={(e) => setAgreedPriceKes(Number(e.target.value))} className={INPUT} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">New End Date</label>
              <input type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} className={INPUT} />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold text-[13.5px] h-10 rounded-lg hover:bg-gray-50">Cancel</button>
          <button
            onClick={() => renew.mutate()}
            disabled={renew.isPending}
            className="flex-1 bg-[#E8A020] hover:bg-[#C98510] disabled:opacity-50 text-[#02110C] font-bold text-[13.5px] h-10 rounded-lg transition-colors"
          >
            {renew.isPending ? "Renewing…" : "Renew Licence"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `UpgradeModal.tsx`**

Create `frontend/superadmin-portal/src/components/tenants/detail/UpgradeModal.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toaster";
import type { Plan } from "@/types/tenant";

interface Props {
  tenantId: string;
  currentPlanId: string;
  currentSeatCount: number;
  onClose: () => void;
}

const INPUT = "w-full border border-gray-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E]";

export function UpgradeModal({ tenantId, currentPlanId, currentSeatCount, onClose }: Props) {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [newPlanId, setNewPlanId] = useState(currentPlanId);
  const [seatCount, setSeatCount] = useState(currentSeatCount);
  const [agreedPriceKes, setAgreedPriceKes] = useState(0);

  const { data: plans = [] } = useQuery<Plan[]>({
    queryKey: ["plans"],
    queryFn: () => apiClient.get("/api/v1/plans").then((r) => r.data),
  });

  const upgrade = useMutation({
    mutationFn: () =>
      apiClient.post(`/api/v1/super-admin/tenants/${tenantId}/licences/upgrade`, {
        newPlanId, seatCount, agreedPriceKes,
      }).then((r) => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-detail", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["licence-history", tenantId] });
      toast("Licence upgraded", "success");
      onClose();
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? "Upgrade failed";
      toast(msg, "error");
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-[420px] p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-[16px] font-bold text-[#02110C]">Upgrade Plan</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">New Plan</label>
            <select value={newPlanId} onChange={(e) => setNewPlanId(e.target.value)} className={INPUT}>
              {plans.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Seats</label>
              <input type="number" min={1} value={seatCount} onChange={(e) => setSeatCount(Number(e.target.value))} className={INPUT} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Agreed Price (KES)</label>
              <input type="number" min={0} step="0.01" value={agreedPriceKes} onChange={(e) => setAgreedPriceKes(Number(e.target.value))} className={INPUT} />
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold text-[13.5px] h-10 rounded-lg hover:bg-gray-50">Cancel</button>
          <button
            onClick={() => upgrade.mutate()}
            disabled={upgrade.isPending}
            className="flex-1 bg-[#0B3D2E] hover:bg-[#0a3328] disabled:opacity-50 text-white font-bold text-[13.5px] h-10 rounded-lg transition-colors"
          >
            {upgrade.isPending ? "Upgrading…" : "Upgrade"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `LicenceTab.tsx`**

Create `frontend/superadmin-portal/src/components/tenants/detail/LicenceTab.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, ArrowUpCircle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { RenewModal } from "./RenewModal";
import { UpgradeModal } from "./UpgradeModal";
import type { LicenceDetail, LicenceHistory } from "@/types/tenant";

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:    "bg-[#D1F5E6] text-[#0F5040]",
  TRIAL:     "bg-[#E8F5F0] text-[#166A50] border border-[#D1F5E6]",
  SUSPENDED: "bg-[#FEE2E2] text-[#991B1B]",
  EXPIRED:   "bg-gray-100 text-gray-500",
  CANCELLED: "bg-gray-100 text-gray-500",
};

function fmt(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
  });
}

function fmtKes(amount: number) {
  return `KES ${amount.toLocaleString("en-KE", { minimumFractionDigits: 2 })}`;
}

interface Props {
  tenantId: string;
  licence: LicenceDetail | null;
}

export function LicenceTab({ tenantId, licence }: Props) {
  const [showRenew, setShowRenew] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);

  const { data: history = [] } = useQuery<LicenceHistory[]>({
    queryKey: ["licence-history", tenantId],
    queryFn: () =>
      apiClient.get(`/api/v1/super-admin/tenants/${tenantId}/licences/history`).then((r) => r.data),
  });

  if (!licence) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed border-gray-200 rounded-xl">
        <p className="text-[13px] text-gray-400">No licence on record</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-5">
        {/* Current licence card */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <p className="text-[13px] font-bold text-[#02110C]">Current Licence</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRenew(true)}
                className="flex items-center gap-1.5 border border-gray-200 text-gray-600 font-semibold text-[13px] h-8 px-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw size={13} /> Renew
              </button>
              <button
                onClick={() => setShowUpgrade(true)}
                className="flex items-center gap-1.5 bg-[#E8A020] hover:bg-[#C98510] text-[#02110C] font-semibold text-[13px] h-8 px-3 rounded-lg transition-colors"
              >
                <ArrowUpCircle size={13} /> Upgrade
              </button>
            </div>
          </div>
          <div className="px-6 py-4 grid grid-cols-3 gap-x-6 gap-y-4">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Plan</p>
              <p className="text-[13.5px] font-semibold text-[#02110C]">{licence.planName}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Status</p>
              <span className={`inline-flex items-center gap-1 text-[11.5px] font-semibold px-2.5 py-1 rounded-full ${STATUS_BADGE[licence.status] ?? "bg-gray-100 text-gray-500"}`}>
                <span className="w-[5px] h-[5px] rounded-full bg-current" />
                {licence.status.charAt(0) + licence.status.slice(1).toLowerCase()}
              </span>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Billing</p>
              <p className="text-[13.5px] text-[#02110C]">{licence.billingCycle.charAt(0) + licence.billingCycle.slice(1).toLowerCase()}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Seats</p>
              <p className="text-[13.5px] text-[#02110C]">{licence.seatCount}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Agreed Price</p>
              <p className="text-[13.5px] text-[#02110C]">{fmtKes(licence.agreedPriceKes)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Ends</p>
              <p className="text-[13.5px] text-[#02110C]">{fmt(licence.endDate)}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Start Date</p>
              <p className="text-[13.5px] text-[#02110C]">{fmt(licence.startDate)}</p>
            </div>
            <div className="col-span-2">
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">Licence Key</p>
              <code className="text-[12px] font-mono text-gray-500">{licence.licenceKey}</code>
            </div>
          </div>
        </div>

        {/* Licence history */}
        {history.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-[13px] font-bold text-[#02110C]">History</p>
            </div>
            <table className="w-full">
              <thead className="bg-[#FAFAFA]">
                <tr>
                  {["Date", "Change", "Changed by", "Reason"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.05em] text-gray-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h.id} className="border-t border-gray-50">
                    <td className="px-5 py-3 text-[13px] text-gray-500">{fmt(h.changedAt)}</td>
                    <td className="px-5 py-3">
                      <span className="text-[12px] text-gray-400">{h.previousStatus}</span>
                      <span className="text-[12px] text-gray-400 mx-1.5">→</span>
                      <span className="text-[12px] font-semibold text-[#02110C]">{h.newStatus}</span>
                    </td>
                    <td className="px-5 py-3 text-[13px] text-gray-500">{h.changedBy}</td>
                    <td className="px-5 py-3 text-[13px] text-gray-500">{h.changeReason ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showRenew && (
        <RenewModal
          tenantId={tenantId}
          currentPlanId={licence.planId}
          onClose={() => setShowRenew(false)}
        />
      )}
      {showUpgrade && (
        <UpgradeModal
          tenantId={tenantId}
          currentPlanId={licence.planId}
          currentSeatCount={licence.seatCount}
          onClose={() => setShowUpgrade(false)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 4: TypeScript check**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/superadmin-portal && pnpm tsc --noEmit 2>&1 | head -20
```

Expected: only `TenantActionMenu` and `FeatureFlagsTab` remain missing (created in next task).

- [ ] **Step 5: Commit**

```bash
git add frontend/superadmin-portal/src/components/tenants/
git commit -m "feat(superadmin): add LicenceTab with renew/upgrade modals and licence history"
```

---

## Task 9: Frontend — Feature Flags Tab + Tenant Action Menu

**Files:**
- Create: `frontend/superadmin-portal/src/components/tenants/detail/FeatureFlagsTab.tsx`
- Create: `frontend/superadmin-portal/src/components/tenants/detail/TenantActionMenu.tsx`
- Create: `frontend/superadmin-portal/src/components/tenants/detail/ConfirmModal.tsx`
- Create: `frontend/superadmin-portal/src/components/tenants/detail/SuspendModal.tsx`
- Create: `frontend/superadmin-portal/src/components/tenants/detail/ExtendTrialModal.tsx`

- [ ] **Step 1: Create `ConfirmModal.tsx`**

Create `frontend/superadmin-portal/src/components/tenants/detail/ConfirmModal.tsx`:

```tsx
"use client";

import { X } from "lucide-react";

interface Props {
  title: string;
  message: string;
  confirmLabel: string;
  confirmVariant?: "danger" | "amber" | "primary";
  isPending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  title, message, confirmLabel, confirmVariant = "danger", isPending, onConfirm, onClose,
}: Props) {
  const btnClass = {
    danger:  "bg-red-600 hover:bg-red-700 text-white",
    amber:   "bg-[#E8A020] hover:bg-[#C98510] text-[#02110C]",
    primary: "bg-[#0B3D2E] hover:bg-[#0a3328] text-white",
  }[confirmVariant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-[400px] p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-[16px] font-bold text-[#02110C] pr-4">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 flex-shrink-0"><X size={18} /></button>
        </div>
        <p className="text-[13.5px] text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold text-[13.5px] h-10 rounded-lg hover:bg-gray-50">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className={`flex-1 font-bold text-[13.5px] h-10 rounded-lg transition-colors disabled:opacity-50 ${btnClass}`}
          >
            {isPending ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create `SuspendModal.tsx`**

Create `frontend/superadmin-portal/src/components/tenants/detail/SuspendModal.tsx`:

```tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  isPending?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function SuspendModal({ isPending, onConfirm, onClose }: Props) {
  const [reason, setReason] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-[420px] p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-[16px] font-bold text-[#02110C]">Suspend Tenant</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <p className="text-[13.5px] text-gray-600 mb-4">
          The tenant will lose access immediately. Provide a reason for the suspension record.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. Non-payment of subscription fees"
          maxLength={500}
          rows={3}
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-red-200 focus:border-red-400 resize-none"
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold text-[13.5px] h-10 rounded-lg hover:bg-gray-50">Cancel</button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={isPending || reason.trim().length === 0}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-[13.5px] h-10 rounded-lg transition-colors"
          >
            {isPending ? "Suspending…" : "Suspend Tenant"}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create `ExtendTrialModal.tsx`**

Create `frontend/superadmin-portal/src/components/tenants/detail/ExtendTrialModal.tsx`:

```tsx
"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Props {
  isPending?: boolean;
  onConfirm: (days: number) => void;
  onClose: () => void;
}

export function ExtendTrialModal({ isPending, onConfirm, onClose }: Props) {
  const [days, setDays] = useState(14);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-xl w-[380px] p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-[16px] font-bold text-[#02110C]">Extend Trial</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>
        <p className="text-[13.5px] text-gray-600 mb-4">Add additional days to the current trial period.</p>
        <div>
          <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">Additional Days (1–90)</label>
          <input
            type="number" min={1} max={90} value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-[13.5px] focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 focus:border-[#0B3D2E]"
          />
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 font-semibold text-[13.5px] h-10 rounded-lg hover:bg-gray-50">Cancel</button>
          <button
            onClick={() => onConfirm(days)}
            disabled={isPending || days < 1 || days > 90}
            className="flex-1 bg-[#E8A020] hover:bg-[#C98510] disabled:opacity-50 text-[#02110C] font-bold text-[13.5px] h-10 rounded-lg transition-colors"
          >
            {isPending ? "Extending…" : `Extend +${days} days`}
          </button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `TenantActionMenu.tsx`**

Create `frontend/superadmin-portal/src/components/tenants/detail/TenantActionMenu.tsx`:

```tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  MoreHorizontal, Ban, CheckCircle2, Clock, Trash2,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toaster";
import { ConfirmModal } from "./ConfirmModal";
import { SuspendModal } from "./SuspendModal";
import { ExtendTrialModal } from "./ExtendTrialModal";
import type { TenantStatus } from "@/types/tenant";

interface Props {
  tenantId: string;
  status: TenantStatus;
}

export function TenantActionMenu({ tenantId, status }: Props) {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<"suspend" | "reactivate" | "extend" | "delete" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const suspend = useMutation({
    mutationFn: (reason: string) =>
      apiClient.patch(`/api/v1/super-admin/tenants/${tenantId}/suspend`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-detail", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenants-list"] });
      toast("Tenant suspended", "warning");
      setModal(null);
    },
    onError: () => toast("Failed to suspend tenant", "error"),
  });

  const reactivate = useMutation({
    mutationFn: () =>
      apiClient.patch(`/api/v1/super-admin/tenants/${tenantId}/reactivate`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-detail", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenants-list"] });
      toast("Tenant reactivated", "success");
      setModal(null);
    },
    onError: () => toast("Failed to reactivate tenant", "error"),
  });

  const extendTrial = useMutation({
    mutationFn: (additionalDays: number) =>
      apiClient.patch(`/api/v1/super-admin/tenants/${tenantId}/extend-trial`, { additionalDays }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant-detail", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["tenants-list"] });
      toast("Trial extended", "success");
      setModal(null);
    },
    onError: () => toast("Failed to extend trial", "error"),
  });

  const cancel = useMutation({
    mutationFn: () =>
      apiClient.delete(`/api/v1/super-admin/tenants/${tenantId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenants-list"] });
      toast("Tenant cancelled", "warning");
      router.push("/tenants");
    },
    onError: () => toast("Failed to cancel tenant", "error"),
  });

  const canSuspend    = status === "ACTIVE" || status === "TRIAL";
  const canReactivate = status === "SUSPENDED";
  const canExtend     = status === "TRIAL";
  const canDelete     = status !== "CANCELLED" && status !== "DELETED";

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-1.5 border border-gray-200 text-gray-600 font-semibold text-[13.5px] h-9 px-3.5 rounded-lg hover:bg-gray-50 transition-colors"
          aria-label="Tenant actions"
        >
          <MoreHorizontal size={15} /> Actions
        </button>
        {open && (
          <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-20">
            {canSuspend && (
              <button
                onClick={() => { setOpen(false); setModal("suspend"); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50"
              >
                <Ban size={14} className="text-amber-500" /> Suspend Tenant
              </button>
            )}
            {canReactivate && (
              <button
                onClick={() => { setOpen(false); setModal("reactivate"); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50"
              >
                <CheckCircle2 size={14} className="text-[#27A870]" /> Reactivate
              </button>
            )}
            {canExtend && (
              <button
                onClick={() => { setOpen(false); setModal("extend"); }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50"
              >
                <Clock size={14} className="text-[#166A50]" /> Extend Trial
              </button>
            )}
            {canDelete && (
              <>
                <div className="my-1 border-t border-gray-100" />
                <button
                  onClick={() => { setOpen(false); setModal("delete"); }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={14} /> Cancel Tenant
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {modal === "suspend" && (
        <SuspendModal
          isPending={suspend.isPending}
          onConfirm={(reason) => suspend.mutate(reason)}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "reactivate" && (
        <ConfirmModal
          title="Reactivate Tenant"
          message="This will restore full access for the tenant. Confirm reactivation?"
          confirmLabel="Reactivate"
          confirmVariant="primary"
          isPending={reactivate.isPending}
          onConfirm={() => reactivate.mutate()}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "extend" && (
        <ExtendTrialModal
          isPending={extendTrial.isPending}
          onConfirm={(days) => extendTrial.mutate(days)}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "delete" && (
        <ConfirmModal
          title="Cancel Tenant"
          message="This will permanently cancel the tenant's subscription. All access will be revoked. This cannot be undone."
          confirmLabel="Cancel Tenant"
          confirmVariant="danger"
          isPending={cancel.isPending}
          onConfirm={() => cancel.mutate()}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 5: Create `FeatureFlagsTab.tsx`**

Create `frontend/superadmin-portal/src/components/tenants/detail/FeatureFlagsTab.tsx`:

```tsx
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useToast } from "@/components/ui/Toaster";
import type { FeatureFlag } from "@/types/tenant";

interface Props {
  tenantId: string;
}

export function FeatureFlagsTab({ tenantId }: Props) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const { data: flags = [], isLoading, isError } = useQuery<FeatureFlag[]>({
    queryKey: ["tenant-flags", tenantId],
    queryFn: () =>
      apiClient.get(`/api/v1/super-admin/tenants/${tenantId}/feature-flags`).then((r) => r.data),
  });

  const toggle = useMutation({
    mutationFn: ({ key, enable }: { key: string; enable: boolean }) =>
      apiClient
        .put(`/api/v1/super-admin/tenants/${tenantId}/feature-flags/${key}/${enable ? "enable" : "disable"}`)
        .then((r) => r.data),
    onMutate: async ({ key, enable }) => {
      await queryClient.cancelQueries({ queryKey: ["tenant-flags", tenantId] });
      const prev = queryClient.getQueryData<FeatureFlag[]>(["tenant-flags", tenantId]);
      queryClient.setQueryData<FeatureFlag[]>(["tenant-flags", tenantId], (old = []) =>
        old.map((f) => (f.featureKey === key ? { ...f, enabled: enable } : f))
      );
      return { prev };
    },
    onError: (_, __, ctx) => {
      queryClient.setQueryData(["tenant-flags", tenantId], ctx?.prev);
      toast("Failed to update feature flag", "error");
    },
    onSuccess: (_, { enable, key }) => {
      toast(`${key} ${enable ? "enabled" : "disabled"}`, "success");
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-5 py-3.5 text-[13px] text-red-700">
        <AlertTriangle size={15} className="flex-shrink-0" />
        Could not load feature flags.
      </div>
    );
  }

  if (flags.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 border border-dashed border-gray-200 rounded-xl">
        <p className="text-[13px] text-gray-400">No feature flags configured for this tenant</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <p className="text-[13px] font-bold text-[#02110C]">Feature Flags</p>
        <p className="text-[12px] text-gray-500 mt-0.5">Toggles flip immediately with optimistic UI — changes persist to the backend.</p>
      </div>
      <div className="divide-y divide-gray-50">
        {flags.map((flag) => (
          <div key={flag.featureKey} className="flex items-center justify-between px-6 py-4">
            <div>
              <p className="text-[13.5px] font-semibold text-[#02110C]">{flag.featureKey}</p>
              {flag.description && (
                <p className="text-[12px] text-gray-500 mt-0.5">{flag.description}</p>
              )}
            </div>
            <button
              onClick={() => toggle.mutate({ key: flag.featureKey, enable: !flag.enabled })}
              disabled={toggle.isPending}
              aria-label={flag.enabled ? "Disable flag" : "Enable flag"}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0B3D2E]/20 ${
                flag.enabled ? "bg-[#27A870]" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                  flag.enabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Full TypeScript check — all components must be present now**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/superadmin-portal && pnpm tsc --noEmit 2>&1 | head -30
```

Expected: 0 errors.

- [ ] **Step 7: Commit all tenant detail components**

```bash
git add frontend/superadmin-portal/src/components/tenants/ \
        frontend/superadmin-portal/src/app/\(dashboard\)/tenants/
git commit -m "feat(superadmin): add tenant detail page — Overview, Licence, Feature Flags tabs + action menu"
```

---

## Task 10: Final Integration — Wire Overview tab commit + smoke test

**Files:**
- No new files

This task commits the `OverviewTab`, `TenantDetailPage` shell, and `Toaster` changes from Task 7 that were deferred (waiting for `LicenceTab` and `FeatureFlagsTab` to compile).

- [ ] **Step 1: Verify all frontend files compile cleanly**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/superadmin-portal && pnpm tsc --noEmit 2>&1
```

Expected: 0 errors (all component dependencies are now in place).

- [ ] **Step 2: Run full backend test suite for tenant-service**

```bash
cd /Users/lawrence-eq/Projects/andikisha && ./gradlew :services:tenant-service:test 2>&1 | tail -15
```

Expected: `BUILD SUCCESSFUL`.

- [ ] **Step 3: Check git status for any uncommitted files**

```bash
git status --short | grep -E "superadmin-portal|tenant-service"
```

Expected: all files committed (empty output or only unrelated changes).

- [ ] **Step 4: Final commit if any stragglers exist**

```bash
git add services/tenant-service/ frontend/superadmin-portal/
git commit -m "chore(superadmin): finalize tenants section — all tasks complete"
```

- [ ] **Step 5: Verify dev server starts without errors**

Start the dev server:
```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/superadmin-portal && pnpm dev 2>&1 | head -20
```

Expected: `✓ Ready in Xs`, no compile errors.

---

## Spec Coverage Check

| Spec section | Covered by |
|---|---|
| Tenant list panel — filter tabs All/Trial/Active/Suspended | Task 5 |
| Tenant list panel — search + sortable table | Task 5 (search param, TenantTable sorter) |
| Click row → detail page | Task 5 (TenantTable already has onClick nav) |
| New tenant provisioning | Task 6 |
| Detail header + action menu (Suspend/Reactivate/Delete) | Task 9 (TenantActionMenu) |
| Extend trial action | Task 9 (TenantActionMenu → ExtendTrialModal) |
| Overview tab — profile, statutory, pay schedule | Task 7 |
| Licence tab — current licence, renew/upgrade actions | Task 8 |
| Feature Flags tab — toggles + optimistic UI | Task 9 |
| Backend extend-trial endpoint | Tasks 1–2 |
| Backend soft-delete endpoint | Task 2 |
| Backend super-admin feature flag endpoints | Task 2 |
| Toasts — success/error, 4s auto-dismiss | Task 4 |
| Skeleton loaders | Task 5 (TenantTable), Task 7 (detail page) |
| Onboarding / Employees / Audit tabs | Placeholder (Phase 2) |
