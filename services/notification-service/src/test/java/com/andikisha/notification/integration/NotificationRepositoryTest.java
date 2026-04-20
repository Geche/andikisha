package com.andikisha.notification.integration;

import com.andikisha.notification.domain.model.Notification;
import com.andikisha.notification.domain.model.NotificationChannel;
import com.andikisha.notification.domain.model.NotificationPriority;
import com.andikisha.notification.domain.model.NotificationStatus;
import com.andikisha.notification.domain.repository.NotificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

import java.time.LocalDateTime;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers(disabledWithoutDocker = true)
@Import(FlywayAutoConfiguration.class)
class NotificationRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("test_notification")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("spring.flyway.locations", () -> "classpath:db/migration");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
    }

    @Autowired
    NotificationRepository repository;

    private static final String TENANT_A  = "tenant-alpha";
    private static final String TENANT_B  = "tenant-beta";
    private static final UUID   RECIPIENT = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    // -------------------------------------------------------------------------
    // findRetryableNotifications
    // -------------------------------------------------------------------------

    @Test
    void findRetryableNotifications_returnsOnlyRetryingStatus() {
        save(TENANT_A, RECIPIENT, NotificationStatus.RETRYING);
        save(TENANT_A, RECIPIENT, NotificationStatus.SENT);
        save(TENANT_A, RECIPIENT, NotificationStatus.FAILED);

        List<Notification> result = repository.findRetryableNotifications(
                LocalDateTime.now().minusMinutes(5), PageRequest.of(0, 100));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getStatus()).isEqualTo(NotificationStatus.RETRYING);
    }

    @Test
    void findRetryableNotifications_respectsPageLimit() {
        for (int i = 0; i < 5; i++) {
            save(TENANT_A, RECIPIENT, NotificationStatus.RETRYING);
        }

        List<Notification> result = repository.findRetryableNotifications(
                LocalDateTime.now().minusMinutes(5), PageRequest.of(0, 3));

        assertThat(result).hasSize(3);
    }

    @Test
    void findRetryableNotifications_spansAllTenants() {
        save(TENANT_A, RECIPIENT, NotificationStatus.RETRYING);
        save(TENANT_B, RECIPIENT, NotificationStatus.RETRYING);

        List<Notification> result = repository.findRetryableNotifications(
                LocalDateTime.now().minusMinutes(5), PageRequest.of(0, 100));

        assertThat(result).hasSize(2);
    }

    // -------------------------------------------------------------------------
    // findByTenantIdAndRecipientId — tenant isolation
    // -------------------------------------------------------------------------

    @Test
    void findByTenantIdAndRecipientId_isolatesByTenant() {
        UUID recipientA = UUID.randomUUID();
        UUID recipientB = UUID.randomUUID();
        save(TENANT_A, recipientA, NotificationStatus.SENT);
        save(TENANT_B, recipientB, NotificationStatus.SENT);

        var page = repository.findByTenantIdAndRecipientIdOrderByCreatedAtDesc(
                TENANT_A, recipientA, PageRequest.of(0, 10));

        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getContent().get(0).getTenantId()).isEqualTo(TENANT_A);
    }

    // -------------------------------------------------------------------------
    // countByTenantIdAndRecipientIdAndStatus
    // -------------------------------------------------------------------------

    @Test
    void countUnread_countsOnlySentForCorrectTenantAndRecipient() {
        UUID r1 = UUID.randomUUID();
        UUID r2 = UUID.randomUUID();
        save(TENANT_A, r1, NotificationStatus.SENT);
        save(TENANT_A, r1, NotificationStatus.SENT);
        save(TENANT_A, r1, NotificationStatus.PENDING);
        save(TENANT_B, r1, NotificationStatus.SENT);  // different tenant
        save(TENANT_A, r2, NotificationStatus.SENT);  // different recipient

        long count = repository.countByTenantIdAndRecipientIdAndStatus(
                TENANT_A, r1, NotificationStatus.SENT);

        assertThat(count).isEqualTo(2);
    }

    // -------------------------------------------------------------------------
    // findByIdAndTenantId
    // -------------------------------------------------------------------------

    @Test
    void findByIdAndTenantId_returnsEmptyForWrongTenant() {
        Notification n = save(TENANT_A, RECIPIENT, NotificationStatus.SENT);

        assertThat(repository.findByIdAndTenantId(n.getId(), TENANT_B)).isEmpty();
    }

    @Test
    void findByIdAndTenantId_returnsNotificationForCorrectTenant() {
        Notification n = save(TENANT_A, RECIPIENT, NotificationStatus.SENT);

        assertThat(repository.findByIdAndTenantId(n.getId(), TENANT_A)).isPresent();
    }

    // -------------------------------------------------------------------------
    // helpers
    // -------------------------------------------------------------------------

    private Notification save(String tenantId, UUID recipientId, NotificationStatus status) {
        Notification n = Notification.create(
                tenantId, recipientId, "Test User", "test@co.ke", null,
                NotificationChannel.EMAIL, "TEST", "Subject", "Body",
                NotificationPriority.NORMAL, "src-evt-1", "TestEvent");

        try {
            var statusField = Notification.class.getDeclaredField("status");
            statusField.setAccessible(true);
            statusField.set(n, status);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }

        return repository.save(n);
    }
}
