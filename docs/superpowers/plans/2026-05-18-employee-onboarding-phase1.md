# Employee Onboarding Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix the 7 critical gaps in the employee onboarding flow so a new employee can receive credentials by email, set their own password on first login, and use the portal securely.

**Architecture:** Auth-service generates a random temp password when provisioning an employee user (removing phone-as-password). It emits `EmployeeUserProvisionedEvent` which notification-service consumes to send a credential welcome email. `must_change_password` is stored in the DB and included in the JWT, which the frontend middleware reads to enforce a change-password redirect. Password reset uses a Redis-stored token (no DB migration). Tenant creation rolls back if admin provisioning fails.

**Tech Stack:** Spring Boot 3.4, Java 21, RabbitMQ (topic exchange), Redis (StringRedisTemplate), Flyway, Next.js 15 App Router, TypeScript, jose (JWT decode in middleware)

---

## File Map

**Created:**
- `shared/andikisha-common/src/main/java/com/andikisha/common/util/PasswordGenerator.java`
- `shared/andikisha-events/src/main/java/com/andikisha/events/auth/EmployeeUserProvisionedEvent.java`
- `shared/andikisha-events/src/main/java/com/andikisha/events/auth/PasswordResetRequestedEvent.java`
- `services/auth-service/src/main/resources/db/migration/V13__add_must_change_password.sql`
- `services/notification-service/src/main/java/com/andikisha/notification/application/listener/AuthEventListener.java`
- `services/auth-service/src/main/java/com/andikisha/auth/application/dto/request/ForgotPasswordRequest.java`
- `services/auth-service/src/main/java/com/andikisha/auth/application/dto/request/ResetPasswordRequest.java`
- `frontend/tenant-portal/src/app/(my)/my/change-password/page.tsx`
- `frontend/tenant-portal/src/app/reset-password/[token]/page.tsx`
- `frontend/tenant-portal/src/app/api/auth/change-password/route.ts`
- `frontend/tenant-portal/src/app/api/auth/forgot-password/route.ts`
- `frontend/tenant-portal/src/app/api/auth/reset-password/route.ts`

**Modified:**
- `shared/andikisha-events/src/main/java/com/andikisha/events/BaseEvent.java` — add `@JsonSubTypes` entries
- `services/auth-service/src/main/java/com/andikisha/auth/domain/model/User.java` — add `mustChangePassword` field + methods
- `services/auth-service/src/main/java/com/andikisha/auth/application/service/AuthService.java` — fix `provisionEmployeeUser()`, add `forgotPassword()`, `resetPassword()`, update `changePassword()`
- `services/auth-service/src/main/java/com/andikisha/auth/application/dto/response/UserResponse.java` — add `mustChangePassword`
- `services/auth-service/src/main/java/com/andikisha/auth/application/mapper/UserMapper.java` — map new field
- `services/auth-service/src/main/java/com/andikisha/auth/infrastructure/jwt/JwtTokenProvider.java` — add `mustChangePassword` claim
- `services/auth-service/src/main/java/com/andikisha/auth/infrastructure/messaging/EmployeeCreatedListener.java` — use `PasswordGenerator`, publish `EmployeeUserProvisionedEvent`
- `services/auth-service/src/main/java/com/andikisha/auth/application/port/AuthEventPublisher.java` — add `publishEmployeeUserProvisioned()`, `publishPasswordResetRequested()`
- `services/auth-service/src/main/java/com/andikisha/auth/infrastructure/messaging/RabbitAuthEventPublisher.java` — implement new publisher methods
- `services/auth-service/src/main/java/com/andikisha/auth/infrastructure/config/RabbitMqConfig.java` — no change needed (already has `auth.events` exchange)
- `services/auth-service/src/main/java/com/andikisha/auth/presentation/controller/AuthController.java` — add forgot-password + reset-password endpoints
- `services/tenant-service/src/main/java/com/andikisha/tenant/application/service/SuperAdminTenantService.java` — remove silent catch
- `services/tenant-service/src/main/java/com/andikisha/tenant/application/service/PasswordGenerator.java` — update import to use common
- `services/notification-service/src/main/java/com/andikisha/notification/application/listener/EmployeeEventListener.java` — remove credential content from `handleCreated()`
- `services/notification-service/src/main/java/com/andikisha/notification/infrastructure/config/RabbitMqConfig.java` — add `notification.auth-events` queue bound to `auth.events`
- `services/auth-service/src/main/java/com/andikisha/common/infrastructure/cache/RedisKeys.java` — add `passwordReset()` key method
- `frontend/tenant-portal/src/middleware.ts` — add `mustChangePassword` redirect
- `frontend/tenant-portal/src/app/api/auth/me/route.ts` — pass through `mustChangePassword`
- `frontend/tenant-portal/src/app/login/page.tsx` — wire "Forgot Password?" button

---

## Task 1: Fix `provisionEmployeeUser()` — link employeeId + Flyway V13 + User entity

**Files:**
- Modify: `services/auth-service/src/main/resources/db/migration/V13__add_must_change_password.sql` (Create)
- Modify: `services/auth-service/src/main/java/com/andikisha/auth/domain/model/User.java`
- Modify: `services/auth-service/src/main/java/com/andikisha/auth/application/service/AuthService.java:126-150`
- Modify: `services/auth-service/src/main/java/com/andikisha/auth/application/dto/response/UserResponse.java`
- Modify: `services/auth-service/src/main/java/com/andikisha/auth/application/mapper/UserMapper.java`

- [ ] **Step 1: Create Flyway migration V13**

Create `services/auth-service/src/main/resources/db/migration/V13__add_must_change_password.sql`:

```sql
ALTER TABLE users
    ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT TRUE;

-- Existing users (admin accounts) already set a real password; mark them as not requiring a forced change.
-- This prevents locking out any currently active admin accounts when the migration runs.
UPDATE users SET must_change_password = FALSE WHERE role = 'ADMIN' OR role = 'SUPER_ADMIN';
```

- [ ] **Step 2: Add `mustChangePassword` field and methods to `User` entity**

In `services/auth-service/src/main/java/com/andikisha/auth/domain/model/User.java`:

After the `lockedUntil` field (line 46), add:
```java
    @Column(name = "must_change_password", nullable = false)
    private boolean mustChangePassword = true;
```

After the `changeRole()` method (line 104), add:
```java
    public void clearMustChangePassword() {
        this.mustChangePassword = false;
    }
```

Update `User.create()` static factory (lines 50-61) — add `mustChangePassword = true` explicitly:
```java
    public static User create(String tenantId, String email, String phoneNumber,
                              String passwordHash, Role role) {
        User user = new User();
        user.setTenantId(tenantId);
        user.email = email.toLowerCase().trim();
        user.phoneNumber = phoneNumber;
        user.passwordHash = passwordHash;
        user.role = role;
        user.active = true;
        user.failedLoginAttempts = 0;
        user.mustChangePassword = true;
        return user;
    }
```

- [ ] **Step 3: Add `mustChangePassword` to `UserResponse` record**

Replace `UserResponse.java` entirely:
```java
package com.andikisha.auth.application.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserResponse(
        UUID id,
        String tenantId,
        String email,
        String phoneNumber,
        String role,
        UUID employeeId,
        boolean active,
        boolean mustChangePassword,
        LocalDateTime lastLogin,
        LocalDateTime createdAt
) {}
```

- [ ] **Step 4: Update UserMapper to map `mustChangePassword`**

`UserMapper.java` uses MapStruct — the field name matches exactly, so no explicit `@Mapping` is needed. Verify the mapper compiles by running:
```bash
cd /Users/lawrence-eq/Projects/andikisha && ./gradlew :services:auth-service:compileJava --quiet
```
Expected: no output (clean build).

- [ ] **Step 5: Fix `provisionEmployeeUser()` to link `employee_id`**

In `AuthService.java`, the current `provisionEmployeeUser()` at lines 126-150 saves the user without calling `user.linkEmployee()`. Replace the method body:

```java
    @Transactional
    public String provisionEmployeeUser(String tenantId, String email,
                                        String phone, String initialPassword,
                                        String employeeId) {
        if (userRepository.existsByEmailAndTenantId(email, tenantId)) {
            return userRepository.findByEmailAndTenantId(email, tenantId)
                    .map(u -> u.getId().toString())
                    .orElseThrow(() -> new IllegalStateException(
                            "User exists by email but not found for tenantId=" + tenantId));
        }
        String passwordHash = passwordEncoder.encode(initialPassword);
        User employee = User.create(tenantId, email, phone, passwordHash, Role.EMPLOYEE);
        employee.linkEmployee(UUID.fromString(employeeId));   // ← fix: was missing
        User saved = userRepository.save(employee);
        if (TransactionSynchronizationManager.isSynchronizationActive()) {
            TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                @Override
                public void afterCommit() {
                    eventPublisher.publishUserRegistered(saved);
                }
            });
        } else {
            eventPublisher.publishUserRegistered(saved);
        }
        return saved.getId().toString();
    }
```

- [ ] **Step 6: Build and verify**

```bash
cd /Users/lawrence-eq/Projects/andikisha && ./gradlew :services:auth-service:compileJava --quiet
```
Expected: no output.

- [ ] **Step 7: Commit**

```bash
cd /Users/lawrence-eq/Projects/andikisha && git add \
  services/auth-service/src/main/resources/db/migration/V13__add_must_change_password.sql \
  services/auth-service/src/main/java/com/andikisha/auth/domain/model/User.java \
  services/auth-service/src/main/java/com/andikisha/auth/application/service/AuthService.java \
  services/auth-service/src/main/java/com/andikisha/auth/application/dto/response/UserResponse.java \
  services/auth-service/src/main/java/com/andikisha/auth/application/mapper/UserMapper.java && \
git commit -m "fix(auth): link employeeId on provisionEmployeeUser + add must_change_password column"
```

---

## Task 2: Move PasswordGenerator to andikisha-common; use random temp passwords

**Files:**
- Create: `shared/andikisha-common/src/main/java/com/andikisha/common/util/PasswordGenerator.java`
- Modify: `services/tenant-service/src/main/java/com/andikisha/tenant/application/service/PasswordGenerator.java` — delete and update import
- Modify: `services/auth-service/src/main/java/com/andikisha/auth/infrastructure/messaging/EmployeeCreatedListener.java`

- [ ] **Step 1: Create PasswordGenerator in andikisha-common**

Create `shared/andikisha-common/src/main/java/com/andikisha/common/util/PasswordGenerator.java`:

```java
package com.andikisha.common.util;

import java.security.SecureRandom;

/**
 * Generates cryptographically random temporary passwords.
 * 20 base-62 characters give ~119 bits of entropy (log2(62^20)).
 */
public final class PasswordGenerator {

    private static final String CHARSET =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int LENGTH = 20;
    private static final SecureRandom RANDOM = new SecureRandom();

    private PasswordGenerator() {}

    public static String generate() {
        StringBuilder sb = new StringBuilder(LENGTH);
        for (int i = 0; i < LENGTH; i++) {
            sb.append(CHARSET.charAt(RANDOM.nextInt(CHARSET.length())));
        }
        return sb.toString();
    }
}
```

- [ ] **Step 2: Update tenant-service PasswordGenerator to delegate to common**

Replace `services/tenant-service/src/main/java/com/andikisha/tenant/application/service/PasswordGenerator.java` entirely:

```java
package com.andikisha.tenant.application.service;

import org.springframework.stereotype.Component;

/**
 * Delegates to the shared PasswordGenerator in andikisha-common.
 * Kept as a Spring bean so SuperAdminTenantService injection is unchanged.
 */
@Component
public class PasswordGenerator {

    public String generate() {
        return com.andikisha.common.util.PasswordGenerator.generate();
    }
}
```

- [ ] **Step 3: Update EmployeeCreatedListener to generate a random temp password**

Replace `services/auth-service/src/main/java/com/andikisha/auth/infrastructure/messaging/EmployeeCreatedListener.java` entirely:

```java
package com.andikisha.auth.infrastructure.messaging;

import com.andikisha.auth.application.port.AuthEventPublisher;
import com.andikisha.auth.application.service.AuthService;
import com.andikisha.auth.infrastructure.config.RabbitMqConfig;
import com.andikisha.common.util.PasswordGenerator;
import com.andikisha.events.employee.EmployeeCreatedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class EmployeeCreatedListener {

    private static final Logger log = LoggerFactory.getLogger(EmployeeCreatedListener.class);

    private final AuthService authService;
    private final AuthEventPublisher eventPublisher;

    public EmployeeCreatedListener(AuthService authService, AuthEventPublisher eventPublisher) {
        this.authService = authService;
        this.eventPublisher = eventPublisher;
    }

    @RabbitListener(queues = RabbitMqConfig.EMPLOYEE_CREATED_QUEUE)
    public void onEmployeeCreated(EmployeeCreatedEvent event) {
        if (event.getEmail() == null || event.getEmail().isBlank()) {
            log.warn("EmployeeCreatedEvent missing email for tenant={} employee={} — skipping user creation",
                    event.getTenantId(), event.getEmployeeId());
            return;
        }

        try {
            String tempPassword = PasswordGenerator.generate();

            authService.provisionEmployeeUser(
                    event.getTenantId(),
                    event.getEmail(),
                    event.getPhoneNumber(),
                    tempPassword,
                    event.getEmployeeId());

            // Publish provisioned event so notification-service sends the credential welcome email.
            eventPublisher.publishEmployeeUserProvisioned(
                    event.getTenantId(),
                    event.getEmployeeId(),
                    event.getEmail(),
                    event.getFirstName(),
                    event.getLastName(),
                    event.getEmployeeNumber(),
                    tempPassword);

            log.info("Provisioned EMPLOYEE auth user for tenant={} employee={} email={}",
                    event.getTenantId(), event.getEmployeeId(), event.getEmail());
        } catch (Exception ex) {
            log.error("Failed to provision auth user for employee={} tenant={}",
                    event.getEmployeeId(), event.getTenantId(), ex);
        }
    }
}
```

- [ ] **Step 4: Build auth-service and andikisha-common**

```bash
cd /Users/lawrence-eq/Projects/andikisha && \
  ./gradlew :shared:andikisha-common:compileJava --quiet && \
  ./gradlew :services:auth-service:compileJava --quiet
```
Expected: no output (will fail until Task 3 adds `publishEmployeeUserProvisioned` to the port — that's fine, proceed to Task 3 immediately).

- [ ] **Step 5: Commit (after Task 3 makes it compile)**

Defer commit to end of Task 3.

---

## Task 3: New events + auth-service event publisher

**Files:**
- Create: `shared/andikisha-events/src/main/java/com/andikisha/events/auth/EmployeeUserProvisionedEvent.java`
- Create: `shared/andikisha-events/src/main/java/com/andikisha/events/auth/PasswordResetRequestedEvent.java`
- Modify: `shared/andikisha-events/src/main/java/com/andikisha/events/BaseEvent.java`
- Modify: `services/auth-service/src/main/java/com/andikisha/auth/application/port/AuthEventPublisher.java`
- Modify: `services/auth-service/src/main/java/com/andikisha/auth/infrastructure/messaging/RabbitAuthEventPublisher.java`

- [ ] **Step 1: Create `EmployeeUserProvisionedEvent`**

Create `shared/andikisha-events/src/main/java/com/andikisha/events/auth/EmployeeUserProvisionedEvent.java`:

```java
package com.andikisha.events.auth;

import com.andikisha.events.BaseEvent;
import lombok.Getter;

@Getter
public class EmployeeUserProvisionedEvent extends BaseEvent {

    private String employeeId;
    private String email;
    private String firstName;
    private String lastName;
    private String employeeNumber;
    private String tempPassword;

    protected EmployeeUserProvisionedEvent() {}

    public EmployeeUserProvisionedEvent(String tenantId, String employeeId,
                                        String email, String firstName, String lastName,
                                        String employeeNumber, String tempPassword) {
        super("EmployeeUserProvisioned", tenantId);
        this.employeeId = employeeId;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.employeeNumber = employeeNumber;
        this.tempPassword = tempPassword;
    }
}
```

- [ ] **Step 2: Create `PasswordResetRequestedEvent`**

Create `shared/andikisha-events/src/main/java/com/andikisha/events/auth/PasswordResetRequestedEvent.java`:

```java
package com.andikisha.events.auth;

import com.andikisha.events.BaseEvent;
import lombok.Getter;

@Getter
public class PasswordResetRequestedEvent extends BaseEvent {

    private String email;
    private String resetToken;

    protected PasswordResetRequestedEvent() {}

    public PasswordResetRequestedEvent(String tenantId, String email, String resetToken) {
        super("PasswordResetRequested", tenantId);
        this.email = email;
        this.resetToken = resetToken;
    }
}
```

- [ ] **Step 3: Register both events in `BaseEvent` `@JsonSubTypes`**

In `shared/andikisha-events/src/main/java/com/andikisha/events/BaseEvent.java`, add two entries to the `@JsonSubTypes` list (after the existing `UserDeactivatedEvent` entry):

```java
        @JsonSubTypes.Type(value = EmployeeUserProvisionedEvent.class, name = "EmployeeUserProvisioned"),
        @JsonSubTypes.Type(value = PasswordResetRequestedEvent.class,  name = "PasswordResetRequested"),
```

Also add the imports at the top of the imports block:
```java
import com.andikisha.events.auth.EmployeeUserProvisionedEvent;
import com.andikisha.events.auth.PasswordResetRequestedEvent;
```

- [ ] **Step 4: Add methods to `AuthEventPublisher` port**

Replace `services/auth-service/src/main/java/com/andikisha/auth/application/port/AuthEventPublisher.java` entirely:

```java
package com.andikisha.auth.application.port;

import com.andikisha.auth.domain.model.User;

public interface AuthEventPublisher {

    void publishUserRegistered(User user);

    void publishUserDeactivated(String tenantId, String userId);

    void publishEmployeeUserProvisioned(String tenantId, String employeeId,
                                        String email, String firstName, String lastName,
                                        String employeeNumber, String tempPassword);

    void publishPasswordResetRequested(String tenantId, String email, String resetToken);
}
```

- [ ] **Step 5: Implement new methods in `RabbitAuthEventPublisher`**

Add these two methods to `services/auth-service/src/main/java/com/andikisha/auth/infrastructure/messaging/RabbitAuthEventPublisher.java`:

```java
    @Override
    public void publishEmployeeUserProvisioned(String tenantId, String employeeId,
                                               String email, String firstName, String lastName,
                                               String employeeNumber, String tempPassword) {
        var event = new com.andikisha.events.auth.EmployeeUserProvisionedEvent(
                tenantId, employeeId, email, firstName, lastName, employeeNumber, tempPassword);
        rabbitTemplate.convertAndSend(RabbitMqConfig.AUTH_EXCHANGE, "auth.employee_provisioned", event);
        log.info("Published EmployeeUserProvisioned for employee={}", employeeId);
    }

    @Override
    public void publishPasswordResetRequested(String tenantId, String email, String resetToken) {
        var event = new com.andikisha.events.auth.PasswordResetRequestedEvent(tenantId, email, resetToken);
        rabbitTemplate.convertAndSend(RabbitMqConfig.AUTH_EXCHANGE, "auth.password_reset_requested", event);
        log.info("Published PasswordResetRequested for email={}", email);
    }
```

Also add the import at the top of the file:
```java
import com.andikisha.events.auth.EmployeeUserProvisionedEvent;
import com.andikisha.events.auth.PasswordResetRequestedEvent;
```

- [ ] **Step 6: Build to confirm compilation**

```bash
cd /Users/lawrence-eq/Projects/andikisha && \
  ./gradlew :shared:andikisha-events:compileJava --quiet && \
  ./gradlew :services:auth-service:compileJava --quiet
```
Expected: no output.

- [ ] **Step 7: Commit Tasks 2 and 3 together**

```bash
cd /Users/lawrence-eq/Projects/andikisha && git add \
  shared/andikisha-common/src/main/java/com/andikisha/common/util/PasswordGenerator.java \
  shared/andikisha-events/src/main/java/com/andikisha/events/auth/EmployeeUserProvisionedEvent.java \
  shared/andikisha-events/src/main/java/com/andikisha/events/auth/PasswordResetRequestedEvent.java \
  shared/andikisha-events/src/main/java/com/andikisha/events/BaseEvent.java \
  services/tenant-service/src/main/java/com/andikisha/tenant/application/service/PasswordGenerator.java \
  services/auth-service/src/main/java/com/andikisha/auth/infrastructure/messaging/EmployeeCreatedListener.java \
  services/auth-service/src/main/java/com/andikisha/auth/application/port/AuthEventPublisher.java \
  services/auth-service/src/main/java/com/andikisha/auth/infrastructure/messaging/RabbitAuthEventPublisher.java && \
git commit -m "feat(auth): random temp password for employee provisioning + EmployeeUserProvisionedEvent"
```

---

## Task 4: notification-service — credential welcome email

**Files:**
- Modify: `services/notification-service/src/main/java/com/andikisha/notification/infrastructure/config/RabbitMqConfig.java`
- Create: `services/notification-service/src/main/java/com/andikisha/notification/application/listener/AuthEventListener.java`
- Modify: `services/notification-service/src/main/java/com/andikisha/notification/application/listener/EmployeeEventListener.java`

- [ ] **Step 1: Add `notification.auth-events` queue to notification-service RabbitMqConfig**

In `services/notification-service/src/main/java/com/andikisha/notification/infrastructure/config/RabbitMqConfig.java`, add the following (alongside the existing queue beans — after `notificationTenantQueue()`):

```java
    public static final String AUTH_EXCHANGE = "auth.events";

    @Bean TopicExchange authExchange() {
        return new TopicExchange(AUTH_EXCHANGE, true, false);
    }

    @Bean Queue notificationAuthQueue() {
        return QueueBuilder.durable("notification.auth-events")
                .withArgument("x-dead-letter-exchange", "dlx.notification").build();
    }

    @Bean Binding bindAuth(Queue notificationAuthQueue, TopicExchange authExchange) {
        return BindingBuilder.bind(notificationAuthQueue).to(authExchange).with("auth.*");
    }
```

- [ ] **Step 2: Create `AuthEventListener` in notification-service**

Create `services/notification-service/src/main/java/com/andikisha/notification/application/listener/AuthEventListener.java`:

```java
package com.andikisha.notification.application.listener;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.auth.EmployeeUserProvisionedEvent;
import com.andikisha.events.auth.PasswordResetRequestedEvent;
import com.andikisha.notification.application.service.NotificationService;
import com.andikisha.notification.domain.model.NotificationChannel;
import com.andikisha.notification.domain.model.NotificationPriority;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class AuthEventListener {

    private static final Logger log = LoggerFactory.getLogger(AuthEventListener.class);

    private final NotificationService notificationService;
    private final String portalUrl;

    public AuthEventListener(NotificationService notificationService,
                             @Value("${app.portal-url:http://localhost:3000}") String portalUrl) {
        this.notificationService = notificationService;
        this.portalUrl = portalUrl;
    }

    @RabbitListener(queues = "notification.auth-events")
    public void handle(BaseEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            switch (event) {
                case EmployeeUserProvisionedEvent e -> handleProvisioned(e);
                case PasswordResetRequestedEvent e  -> handlePasswordReset(e);
                default -> log.debug("Ignoring auth event: {}", event.getEventType());
            }
        } finally {
            TenantContext.clear();
        }
    }

    private void handleProvisioned(EmployeeUserProvisionedEvent event) {
        String subject = "Welcome to AndikishaHR — Your Account is Ready";
        String body = "Dear " + event.getFirstName() + " " + event.getLastName() + ",\n\n"
                + "Welcome aboard! Your employee number is " + event.getEmployeeNumber() + ".\n\n"
                + "Your account has been created. To access the employee portal, use the details below:\n\n"
                + "  Portal:   " + portalUrl + "\n"
                + "  Email:    " + event.getEmail() + "\n"
                + "  Password: " + event.getTempPassword() + "\n\n"
                + "You will be asked to change this password when you first log in.\n\n"
                + "If you have any questions, please contact the HR department.";

        notificationService.sendNotification(
                event.getTenantId(),
                UUID.fromString(event.getEmployeeId()),
                event.getFirstName() + " " + event.getLastName(),
                event.getEmail(),
                null,
                NotificationChannel.EMAIL,
                "ONBOARDING", subject, body,
                NotificationPriority.HIGH,
                event.getEventId(), event.getEventType());
    }

    private void handlePasswordReset(PasswordResetRequestedEvent event) {
        String resetUrl = portalUrl + "/reset-password/" + event.getResetToken();
        String subject = "Reset Your AndikishaHR Password";
        String body = "You requested a password reset.\n\n"
                + "Click the link below to set a new password (expires in 1 hour):\n\n"
                + "  " + resetUrl + "\n\n"
                + "If you did not request this, you can safely ignore this email.";

        notificationService.sendNotification(
                event.getTenantId(),
                null,
                null,
                event.getEmail(),
                null,
                NotificationChannel.EMAIL,
                "SECURITY", subject, body,
                NotificationPriority.HIGH,
                event.getEventId(), event.getEventType());
    }
}
```

- [ ] **Step 3: Strip credential content from `EmployeeEventListener.handleCreated()`**

In `services/notification-service/src/main/java/com/andikisha/notification/application/listener/EmployeeEventListener.java`, replace `handleCreated()` with a no-op so the old `EmployeeCreatedEvent` no longer triggers a duplicate welcome message (credentials now come via `EmployeeUserProvisionedEvent`):

```java
    private void handleCreated(EmployeeCreatedEvent event) {
        // Credential welcome email is now sent by AuthEventListener on EmployeeUserProvisionedEvent.
        // This event is retained so other listeners (analytics, etc.) can still consume employee.created.
        log.debug("EmployeeCreatedEvent received for employee={} — credential notification deferred to AuthEventListener",
                event.getEmployeeId());
    }
```

- [ ] **Step 4: Add `app.portal-url` config to notification-service application-dev.yml**

In `services/notification-service/src/main/resources/application-dev.yml`, add:
```yaml
app:
  portal-url: ${PORTAL_URL:http://localhost:3000}
```

- [ ] **Step 5: Build notification-service**

```bash
cd /Users/lawrence-eq/Projects/andikisha && ./gradlew :services:notification-service:compileJava --quiet
```
Expected: no output.

- [ ] **Step 6: Commit**

```bash
cd /Users/lawrence-eq/Projects/andikisha && git add \
  services/notification-service/src/main/java/com/andikisha/notification/application/listener/AuthEventListener.java \
  services/notification-service/src/main/java/com/andikisha/notification/application/listener/EmployeeEventListener.java \
  services/notification-service/src/main/java/com/andikisha/notification/infrastructure/config/RabbitMqConfig.java \
  services/notification-service/src/main/resources/application-dev.yml && \
git commit -m "feat(notification): credential welcome email via AuthEventListener on EmployeeUserProvisionedEvent"
```

---

## Task 5: `mustChangePassword` in JWT + middleware redirect

**Files:**
- Modify: `services/auth-service/src/main/java/com/andikisha/auth/infrastructure/jwt/JwtTokenProvider.java`
- Modify: `frontend/tenant-portal/src/middleware.ts`
- Modify: `frontend/tenant-portal/src/app/api/auth/me/route.ts`
- Modify: `shared/andikisha-common/src/main/java/com/andikisha/common/infrastructure/cache/RedisKeys.java`

- [ ] **Step 1: Add `mustChangePassword` claim to `JwtTokenProvider.generateAccessToken()`**

In `services/auth-service/src/main/java/com/andikisha/auth/infrastructure/jwt/JwtTokenProvider.java`, in `generateAccessToken()` (lines 45-62), add the `mustChangePassword` claim after the `employeeId` claim:

```java
    public String generateAccessToken(User user, String planTier) {
        Instant now = Instant.now();
        var builder = Jwts.builder()
                .subject(user.getId().toString())
                .claim("tenantId", user.getTenantId())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("employeeId",
                        user.getEmployeeId() != null ? user.getEmployeeId().toString() : null)
                .claim("mustChangePassword", user.isMustChangePassword());
        if (planTier != null) {
            builder.claim("plan", planTier);
        }
        return builder
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(accessTokenExpirationMs)))
                .signWith(key)
                .compact();
    }
```

- [ ] **Step 2: Add `passwordReset` key to `RedisKeys`**

In `shared/andikisha-common/src/main/java/com/andikisha/common/infrastructure/cache/RedisKeys.java`, add:

```java
    // Password reset token cache. TTL: 1 hour (3600 seconds).
    // Written by Auth Service on forgot-password. Value: "{userId}:{tenantId}".
    // Deleted by Auth Service on successful reset.
    public static String passwordReset(String token) {
        return "pwd:reset:" + token;
    }
```

- [ ] **Step 3: Build auth-service to verify**

```bash
cd /Users/lawrence-eq/Projects/andikisha && ./gradlew :services:auth-service:compileJava --quiet
```
Expected: no output.

- [ ] **Step 4: Update middleware to redirect on `mustChangePassword`**

In `frontend/tenant-portal/src/middleware.ts`, after the existing `roleSet` is built (after line 56), add the `mustChangePassword` check BEFORE the existing role-redirect checks:

```typescript
    // 1. Force change-password redirect for accounts requiring it.
    //    Applies to all roles — both employees and admins must set a real password.
    //    /my/change-password itself is allowed through to avoid redirect loops.
    //    API routes are also allowed through (the change-password BFF needs to work).
    const mustChangePassword = payload.mustChangePassword === true;
    if (mustChangePassword && pathname !== "/my/change-password") {
      return NextResponse.redirect(new URL("/my/change-password", request.url));
    }
```

Also add `/my/change-password` to `PUBLIC_PATHS` at the top of the file — no, it should NOT be public (it requires authentication). The middleware allows it through because the check above skips redirect when the path IS `/my/change-password`. No change to `PUBLIC_PATHS` needed.

Also add `/reset-password` to `PUBLIC_PREFIXES` since the reset-password page is fully public (no cookie required):

```typescript
const PUBLIC_PREFIXES = ["/api/auth/", "/_next/", "/preview", "/reset-password/"];
```

- [ ] **Step 5: Update BFF `/api/auth/me` to pass through `mustChangePassword`**

In `frontend/tenant-portal/src/app/api/auth/me/route.ts`, update the `data` type and `currentUser` shape:

```typescript
  const data = await upstream.json() as {
    id: string;
    tenantId: string;
    email: string;
    role: string;
    roles?: string[];
    employeeId?: string;
    mustChangePassword?: boolean;
  };

  // ...

  const currentUser = {
    userId: data.id,
    tenantId: data.tenantId,
    email: data.email,
    fullName: undefined,
    roles: data.roles ?? [data.role],
    employeeId: data.employeeId ?? undefined,
    mustChangePassword: data.mustChangePassword ?? false,
  };
```

- [ ] **Step 6: Run TypeScript check**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/tenant-portal && npx tsc --noEmit 2>&1 | tail -10
```
Expected: no output.

- [ ] **Step 7: Commit**

```bash
cd /Users/lawrence-eq/Projects/andikisha && git add \
  services/auth-service/src/main/java/com/andikisha/auth/infrastructure/jwt/JwtTokenProvider.java \
  shared/andikisha-common/src/main/java/com/andikisha/common/infrastructure/cache/RedisKeys.java \
  frontend/tenant-portal/src/middleware.ts \
  frontend/tenant-portal/src/app/api/auth/me/route.ts && \
git commit -m "feat(auth): mustChangePassword JWT claim + middleware redirect to /my/change-password"
```

---

## Task 6: `/my/change-password` frontend page + backend `changePassword` update

**Files:**
- Create: `frontend/tenant-portal/src/app/(my)/my/change-password/page.tsx`
- Create: `frontend/tenant-portal/src/app/api/auth/change-password/route.ts`
- Modify: `services/auth-service/src/main/java/com/andikisha/auth/application/service/AuthService.java` — `changePassword()` clears `mustChangePassword`

- [ ] **Step 1: Update backend `changePassword()` to clear `mustChangePassword`**

In `services/auth-service/src/main/java/com/andikisha/auth/application/service/AuthService.java`, in `changePassword()` (lines 218-234), add `user.clearMustChangePassword()` after `user.changePassword()`:

```java
    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        String tenantId = TenantContext.requireTenantId();

        User user = userRepository.findByIdAndTenantId(userId, tenantId)
                .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException();
        }

        user.changePassword(passwordEncoder.encode(request.newPassword()));
        user.clearMustChangePassword();   // ← clears the forced-change flag
        userRepository.save(user);

        // Revoke all refresh tokens to force re-login on other devices
        refreshTokenRepository.revokeAllByUserIdAndTenantId(userId, tenantId);
    }
```

- [ ] **Step 2: Build auth-service**

```bash
cd /Users/lawrence-eq/Projects/andikisha && ./gradlew :services:auth-service:compileJava --quiet
```
Expected: no output.

- [ ] **Step 3: Create change-password BFF route**

Create `frontend/tenant-portal/src/app/api/auth/change-password/route.ts`:

```typescript
"use server";

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";

export async function POST(request: NextRequest) {
  const jar = await cookies();
  const token = jar.get("tenant_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "UNAUTHENTICATED" }, { status: 401 });
  }

  const body = await request.json() as { currentPassword?: string; newPassword?: string };

  let upstream: Response;
  try {
    upstream = await fetch(`${GATEWAY}/api/v1/auth/change-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ currentPassword: body.currentPassword, newPassword: body.newPassword }),
    });
  } catch {
    return NextResponse.json({ error: "GATEWAY_UNREACHABLE" }, { status: 502 });
  }

  if (!upstream.ok) {
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  }

  // On success: clear cookie so the user re-logs in and gets a fresh JWT without mustChangePassword.
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("tenant_token");
  return response;
}
```

- [ ] **Step 4: Create `/my/change-password/page.tsx`**

Create `frontend/tenant-portal/src/app/(my)/my/change-password/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye, EyeOff } from "lucide-react";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent]         = useState(false);
  const [showNew, setShowNew]                 = useState(false);
  const [error, setError]                     = useState<string | null>(null);
  const [loading, setLoading]                 = useState(false);

  const strength = (() => {
    if (newPassword.length === 0) return 0;
    let score = 0;
    if (newPassword.length >= 8)  score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;
    return score;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][strength];
  const strengthColor = ["", "bg-red-500", "bg-amber", "bg-yellow-400", "bg-brand-700"][strength];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { message?: string };
        setError(data.message ?? "Failed to change password. Check your current password and try again.");
        return;
      }

      // Cookie cleared by BFF — redirect to login.
      router.replace("/login");
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm w-full max-w-[400px] p-8">
        <div className="flex items-center justify-center w-12 h-12 bg-brand-50 rounded-xl mb-5">
          <Lock size={22} className="text-brand-700" />
        </div>

        <h1 className="text-[22px] font-bold text-near-black mb-1">Set Your Password</h1>
        <p className="text-[13.5px] text-neutral-500 mb-7">
          Your account requires a password change before you can continue.
        </p>

        <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
          {/* Current password */}
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
              Current (temporary) password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 pr-10 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 disabled:bg-neutral-50"
              />
              <button
                type="button"
                onClick={() => setShowCurrent((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
              New password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 pr-10 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 disabled:bg-neutral-50"
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {newPassword.length > 0 && (
              <div className="mt-2 flex items-center gap-2">
                <div className="flex-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${strengthColor}`}
                    style={{ width: `${(strength / 4) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] text-neutral-500 w-10 text-right">{strengthLabel}</span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
              Confirm new password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 disabled:bg-neutral-50"
            />
          </div>

          {error && (
            <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !currentPassword || !newPassword || !confirmPassword}
            className="mt-1 w-full bg-brand-900 hover:bg-brand-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[14px] py-3 rounded-xl transition-colors"
          >
            {loading ? "Saving…" : "Set New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 5: TypeScript check**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/tenant-portal && npx tsc --noEmit 2>&1 | tail -10
```
Expected: no output.

- [ ] **Step 6: Commit**

```bash
cd /Users/lawrence-eq/Projects/andikisha && git add \
  services/auth-service/src/main/java/com/andikisha/auth/application/service/AuthService.java \
  frontend/tenant-portal/src/app/\(my\)/my/change-password/page.tsx \
  frontend/tenant-portal/src/app/api/auth/change-password/route.ts && \
git commit -m "feat(auth): /my/change-password page + BFF route; changePassword() clears must_change_password"
```

---

## Task 7: Transactional rollback on admin provisioning failure

**Files:**
- Modify: `services/tenant-service/src/main/java/com/andikisha/tenant/application/service/SuperAdminTenantService.java:118-131`

- [ ] **Step 1: Remove the silent catch around `provisionInitialAdmin()`**

In `SuperAdminTenantService.java`, the current code at lines 117-131 is:

```java
        // 4. Provision admin user in Auth Service via gRPC.
        try {
            authServiceClient.provisionInitialAdmin(
                    savedTenant.getTenantId(),
                    normalizedEmail,
                    request.adminFirstName(),
                    request.adminLastName(),
                    request.adminPhone(),
                    temporaryPassword);
        } catch (Exception ex) {
            // Auth Service failure must not abort tenant creation — the
            // SUPER_ADMIN can resend the invite. Log and continue.
            log.error("Auth Service provisionInitialAdmin failed for tenant {} - manual fix required",
                    savedTenant.getTenantId(), ex);
        }
```

Replace it with (no try/catch — let it propagate so `@Transactional` rolls back):

```java
        // 4. Provision admin user in Auth Service via gRPC.
        //    Failure throws an exception, rolling back the tenant + licence rows.
        //    The super-admin sees the error and can retry the entire tenant creation.
        authServiceClient.provisionInitialAdmin(
                savedTenant.getTenantId(),
                normalizedEmail,
                request.adminFirstName(),
                request.adminLastName(),
                request.adminPhone(),
                temporaryPassword);
```

- [ ] **Step 2: Verify the method has `@Transactional`**

Check the method signature. Run:
```bash
grep -n "@Transactional" /Users/lawrence-eq/Projects/andikisha/services/tenant-service/src/main/java/com/andikisha/tenant/application/service/SuperAdminTenantService.java | head -5
```
Expected: at least one `@Transactional` above `createTenantWithLicence()`. If missing, add `@Transactional` to the method.

- [ ] **Step 3: Build tenant-service**

```bash
cd /Users/lawrence-eq/Projects/andikisha && ./gradlew :services:tenant-service:compileJava --quiet
```
Expected: no output.

- [ ] **Step 4: Commit**

```bash
cd /Users/lawrence-eq/Projects/andikisha && git add \
  services/tenant-service/src/main/java/com/andikisha/tenant/application/service/SuperAdminTenantService.java && \
git commit -m "fix(tenant): tenant creation rolls back on auth provisioning failure — remove silent catch"
```

---

## Task 8: Password reset flow (forgot-password + reset-password + frontend)

**Files:**
- Modify: `services/auth-service/src/main/java/com/andikisha/auth/application/service/AuthService.java` — add `forgotPassword()` + `resetPassword()`
- Create: `services/auth-service/src/main/java/com/andikisha/auth/application/dto/request/ForgotPasswordRequest.java`
- Create: `services/auth-service/src/main/java/com/andikisha/auth/application/dto/request/ResetPasswordRequest.java`
- Modify: `services/auth-service/src/main/java/com/andikisha/auth/presentation/controller/AuthController.java` — add two endpoints
- Create: `frontend/tenant-portal/src/app/api/auth/forgot-password/route.ts`
- Create: `frontend/tenant-portal/src/app/api/auth/reset-password/route.ts`
- Create: `frontend/tenant-portal/src/app/reset-password/[token]/page.tsx`
- Modify: `frontend/tenant-portal/src/app/login/page.tsx` — wire "Forgot Password?" button

- [ ] **Step 1: Create `ForgotPasswordRequest` DTO**

Create `services/auth-service/src/main/java/com/andikisha/auth/application/dto/request/ForgotPasswordRequest.java`:

```java
package com.andikisha.auth.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ForgotPasswordRequest(
        @NotBlank(message = "Email is required")
        @Email(message = "Must be a valid email address")
        String email
) {}
```

- [ ] **Step 2: Create `ResetPasswordRequest` DTO**

Create `services/auth-service/src/main/java/com/andikisha/auth/application/dto/request/ResetPasswordRequest.java`:

```java
package com.andikisha.auth.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
        @NotBlank(message = "Reset token is required")
        String token,

        @NotBlank(message = "New password is required")
        @Size(min = 8, max = 128, message = "Password must be 8-128 characters")
        String newPassword
) {}
```

- [ ] **Step 3: Add `forgotPassword()` and `resetPassword()` to `AuthService`**

In `AuthService.java`, add these two methods (before `generateTokenResponse()`):

```java
    @Transactional(readOnly = true)
    public void forgotPassword(ForgotPasswordRequest request) {
        String tenantId = TenantContext.requireTenantId();
        // Respond identically whether the email exists or not to prevent user enumeration.
        userRepository.findByEmailAndTenantId(
                request.email().toLowerCase().trim(), tenantId)
                .ifPresent(user -> {
                    String token = com.andikisha.common.util.PasswordGenerator.generate();
                    String redisKey = com.andikisha.common.infrastructure.cache.RedisKeys.passwordReset(token);
                    // Store "{userId}:{tenantId}" so we can look up and validate on reset.
                    redisTemplate.opsForValue().set(
                            redisKey,
                            user.getId() + ":" + tenantId,
                            java.time.Duration.ofHours(1));
                    eventPublisher.publishPasswordResetRequested(tenantId, request.email(), token);
                });
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        String redisKey = com.andikisha.common.infrastructure.cache.RedisKeys.passwordReset(request.token());
        String stored = redisTemplate.opsForValue().get(redisKey);
        if (stored == null) {
            throw new com.andikisha.common.exception.BusinessRuleException(
                    "Reset token is invalid or has expired.");
        }

        String[] parts = stored.split(":", 2);
        UUID userId   = UUID.fromString(parts[0]);
        String tenantId = parts[1];

        User user = userRepository.findByIdAndTenantId(userId, tenantId)
                .orElseThrow(() -> new com.andikisha.common.exception.ResourceNotFoundException("User", userId));

        user.changePassword(passwordEncoder.encode(request.newPassword()));
        user.clearMustChangePassword();
        userRepository.save(user);

        // Invalidate token and all sessions.
        redisTemplate.delete(redisKey);
        refreshTokenRepository.revokeAllByUserIdAndTenantId(userId, tenantId);
    }
```

Also add the import for `Duration` at the top of the file if not already present:
```java
import java.time.Duration;
```

- [ ] **Step 4: Add endpoints to `AuthController`**

In `AuthController.java`, add after the `changePassword` endpoint:

```java
    @PostMapping("/forgot-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Request a password reset email")
    public void forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Reset password using a token from email")
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
    }
```

Add to the `SecurityConfig.permitAll()` list:
```java
"/api/v1/auth/forgot-password",
"/api/v1/auth/reset-password",
```

- [ ] **Step 5: Build auth-service**

```bash
cd /Users/lawrence-eq/Projects/andikisha && ./gradlew :services:auth-service:compileJava --quiet
```
Expected: no output.

- [ ] **Step 6: Create forgot-password BFF route**

Create `frontend/tenant-portal/src/app/api/auth/forgot-password/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";
const TENANT_ID = process.env.TENANT_ID ?? "";

export async function POST(request: NextRequest) {
  const body = await request.json() as { email?: string };

  if (!TENANT_ID) {
    return NextResponse.json({ error: "PORTAL_NOT_CONFIGURED" }, { status: 503 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${GATEWAY}/api/v1/auth/forgot-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-ID": TENANT_ID,
      },
      body: JSON.stringify({ email: body.email }),
    });
  } catch {
    return NextResponse.json({ error: "GATEWAY_UNREACHABLE" }, { status: 502 });
  }

  // Always return 204 to the client — don't leak whether the email exists.
  return new NextResponse(null, { status: 204 });
}
```

- [ ] **Step 7: Create reset-password BFF route**

Create `frontend/tenant-portal/src/app/api/auth/reset-password/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";

const GATEWAY = process.env.API_GATEWAY_URL ?? "http://localhost:8080";
const TENANT_ID = process.env.TENANT_ID ?? "";

export async function POST(request: NextRequest) {
  const body = await request.json() as { token?: string; newPassword?: string };

  if (!TENANT_ID) {
    return NextResponse.json({ error: "PORTAL_NOT_CONFIGURED" }, { status: 503 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${GATEWAY}/api/v1/auth/reset-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Tenant-ID": TENANT_ID,
      },
      body: JSON.stringify({ token: body.token, newPassword: body.newPassword }),
    });
  } catch {
    return NextResponse.json({ error: "GATEWAY_UNREACHABLE" }, { status: 502 });
  }

  if (!upstream.ok) {
    const data = await upstream.json().catch(() => ({}));
    return NextResponse.json(data, { status: upstream.status });
  }

  return new NextResponse(null, { status: 204 });
}
```

- [ ] **Step 8: Create `/reset-password/[token]/page.tsx`**

Create `frontend/tenant-portal/src/app/reset-password/[token]/page.tsx`:

```tsx
"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function ResetPasswordPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = use(params);
  const router = useRouter();
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError]                     = useState<string | null>(null);
  const [loading, setLoading]                 = useState(false);
  const [done, setDone]                       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({})) as { message?: string };
        setError(data.message ?? "This reset link is invalid or has expired. Request a new one from the login page.");
        return;
      }

      setDone(true);
      setTimeout(() => router.replace("/login"), 2500);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm w-full max-w-[400px] p-8">
        <div className="flex items-center justify-center w-12 h-12 bg-brand-50 rounded-xl mb-5">
          <Lock size={22} className="text-brand-700" />
        </div>

        <h1 className="text-[22px] font-bold text-near-black mb-1">Reset Password</h1>
        <p className="text-[13.5px] text-neutral-500 mb-7">
          Enter your new password below.
        </p>

        {done ? (
          <div className="text-center py-4">
            <p className="text-[14px] font-semibold text-brand-700">Password reset successfully.</p>
            <p className="text-[13px] text-neutral-500 mt-1">Redirecting to login…</p>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
                New password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={8}
                disabled={loading}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 disabled:bg-neutral-50"
              />
            </div>

            <div>
              <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
                Confirm new password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 disabled:bg-neutral-50"
              />
            </div>

            {error && (
              <p className="text-[13px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || !newPassword || !confirmPassword}
              className="mt-1 w-full bg-brand-900 hover:bg-brand-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[14px] py-3 rounded-xl transition-colors"
            >
              {loading ? "Resetting…" : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 9: Wire "Forgot Password?" button in login page**

In `frontend/tenant-portal/src/app/login/page.tsx`, the "Forgot Password?" button is currently:
```tsx
<button
  type="button"
  className="text-[13px] font-medium text-error hover:text-red-600 transition-colors"
>
  Forgot Password?
</button>
```

Add state and modal handling. First, add state at the top of the component (alongside existing state):
```tsx
const [showForgot, setShowForgot] = useState(false);
const [forgotEmail, setForgotEmail] = useState("");
const [forgotLoading, setForgotLoading] = useState(false);
const [forgotSent, setForgotSent] = useState(false);
```

Add the `onClick` to the button:
```tsx
<button
  type="button"
  onClick={() => setShowForgot(true)}
  className="text-[13px] font-medium text-error hover:text-red-600 transition-colors"
>
  Forgot Password?
</button>
```

Add the forgot-password modal before the closing `</div>` of the component:
```tsx
{showForgot && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
    <div className="bg-white rounded-2xl border border-neutral-200 shadow-xl w-full max-w-[380px] p-6">
      <h2 className="text-[16px] font-bold text-near-black mb-1">Forgot Password?</h2>
      {forgotSent ? (
        <>
          <p className="text-[13.5px] text-neutral-600 mt-2">
            If that email address is registered, you will receive a password reset link shortly.
          </p>
          <button
            onClick={() => { setShowForgot(false); setForgotSent(false); setForgotEmail(""); }}
            className="mt-5 w-full border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13.5px] py-2.5 rounded-xl transition-colors"
          >
            Close
          </button>
        </>
      ) : (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setForgotLoading(true);
            try {
              await fetch("/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: forgotEmail }),
              });
              setForgotSent(true);
            } finally {
              setForgotLoading(false);
            }
          }}
          className="flex flex-col gap-4 mt-4"
        >
          <div>
            <label className="block text-[12px] font-semibold text-neutral-600 mb-1.5">
              Email address
            </label>
            <input
              type="email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              disabled={forgotLoading}
              placeholder="you@company.co.ke"
              className="w-full border border-neutral-200 rounded-lg px-3 py-2.5 text-[13.5px] text-near-black focus:outline-none focus:ring-2 focus:ring-brand-900/20 focus:border-brand-900 placeholder:text-neutral-300 disabled:bg-neutral-50"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setShowForgot(false)}
              disabled={forgotLoading}
              className="flex-1 border border-neutral-200 text-neutral-600 hover:bg-neutral-50 font-semibold text-[13.5px] py-2.5 rounded-xl transition-colors disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={forgotLoading || !forgotEmail}
              className="flex-1 bg-brand-900 hover:bg-brand-950 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-[13.5px] py-2.5 rounded-xl transition-colors"
            >
              {forgotLoading ? "Sending…" : "Send Link"}
            </button>
          </div>
        </form>
      )}
    </div>
  </div>
)}
```

- [ ] **Step 10: TypeScript check**

```bash
cd /Users/lawrence-eq/Projects/andikisha/frontend/tenant-portal && npx tsc --noEmit 2>&1 | tail -10
```
Expected: no output.

- [ ] **Step 11: Commit**

```bash
cd /Users/lawrence-eq/Projects/andikisha && git add \
  services/auth-service/src/main/java/com/andikisha/auth/application/dto/request/ForgotPasswordRequest.java \
  services/auth-service/src/main/java/com/andikisha/auth/application/dto/request/ResetPasswordRequest.java \
  services/auth-service/src/main/java/com/andikisha/auth/application/service/AuthService.java \
  services/auth-service/src/main/java/com/andikisha/auth/presentation/controller/AuthController.java \
  services/auth-service/src/main/java/com/andikisha/auth/infrastructure/config/SecurityConfig.java \
  frontend/tenant-portal/src/app/api/auth/forgot-password/route.ts \
  frontend/tenant-portal/src/app/api/auth/reset-password/route.ts \
  "frontend/tenant-portal/src/app/reset-password/[token]/page.tsx" \
  frontend/tenant-portal/src/app/login/page.tsx && \
git commit -m "feat(auth): forgot-password + reset-password flow (Redis token, 1h TTL)"
```

---

## End-to-End Smoke Test

After all 8 tasks are committed, verify the full onboarding flow:

- [ ] **Smoke test 1: New employee gets credential email**
  1. Create a new employee via `POST /admin/employees/new` with a valid email address
  2. Check notification-service logs: should see `"Published EmployeeUserProvisioned"` from auth-service, then `"Sending email"` from notification-service
  3. Verify `users` table in auth DB: `employee_id` is NOT NULL, `must_change_password = true`
  4. If SMTP is configured, verify email received with temp password and portal URL

- [ ] **Smoke test 2: First login forces password change**
  1. Log in via the tenant portal with the temp password from the email
  2. Verify middleware redirects to `/my/change-password` (check browser URL)
  3. Submit the change-password form
  4. Verify redirected to `/login`
  5. Log in with the new password
  6. Verify `/admin/dashboard` or `/my/dashboard` loads normally (no redirect loop)
  7. Verify `must_change_password = false` in the auth DB

- [ ] **Smoke test 3: Forgot password flow**
  1. On the login page, click "Forgot Password?"
  2. Enter the employee email; click "Send Link"
  3. Check auth-service logs for `"Published PasswordResetRequested"`
  4. Check Redis: `pwd:reset:{token}` key exists
  5. Navigate to `/reset-password/{token}` directly (from logs or email)
  6. Set a new password; verify success redirect to `/login`
  7. Log in with the new password; verify access

- [ ] **Smoke test 4: Tenant creation rolls back on gRPC failure**
  1. Stop auth-service (kill the process)
  2. Attempt to create a new tenant via the platform-portal API
  3. Verify the response is a 500 (not 201)
  4. Verify no tenant row was written to the tenant DB
  5. Restart auth-service
