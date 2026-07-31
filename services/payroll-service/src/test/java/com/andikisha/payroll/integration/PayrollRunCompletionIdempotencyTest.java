package com.andikisha.payroll.integration;

import com.andikisha.events.payroll.PaymentsCompletedEvent;
import com.andikisha.payroll.domain.model.PayFrequency;
import com.andikisha.payroll.domain.model.PayrollRun;
import com.andikisha.payroll.domain.model.PayrollStatus;
import com.andikisha.payroll.domain.repository.PayrollRunRepository;
import com.andikisha.payroll.infrastructure.grpc.EmployeeGrpcClient;
import com.andikisha.payroll.infrastructure.grpc.LeaveGrpcClient;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.function.BooleanSupplier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;

/**
 * PAYROLL-BACKLOG-003 Scenario 4 — the payroll side of the "exactly once" concern. integration-hub's
 * {@code maybePublishRunCompleted} fires per transaction commit, so a {@code PaymentsCompletedEvent}
 * can be delivered more than once (Scenario 3 finding). {@code PayrollRun.complete()}'s idempotency
 * guard (audit bug #4) is what makes completion effectively-once: a duplicate delivery must transition
 * the run to COMPLETED at most once, without error or state regression.
 *
 * <p>Exercised against a real RabbitMQ + Postgres. Harness architecture: see
 * {@code docs/decisions/2026-07-31-payroll-disbursement-integration-harness.md}.
 */
@SpringBootTest(properties = {
        "grpc.server.port=-1",
        // GrpcClient auto-config eagerly creates channels for @GrpcClient beans (even mocked ones)
        // and fails on a shaded class; exclude it so the context loads (see PayrollServiceApplicationTest).
        "spring.autoconfigure.exclude=" +
                "net.devh.boot.grpc.client.autoconfigure.GrpcClientAutoConfiguration," +
                "net.devh.boot.grpc.client.autoconfigure.GrpcClientHealthAutoConfiguration"
})
@ActiveProfiles("test")
@Testcontainers(disabledWithoutDocker = true)
class PayrollRunCompletionIdempotencyTest {

    private static final String TENANT_ID = "it-tenant";

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(
            DockerImageName.parse("postgres:16-alpine"))
            .withDatabaseName("test_payroll").withUsername("test").withPassword("test");

    @Container
    static RabbitMQContainer rabbit = new RabbitMQContainer(
            DockerImageName.parse("rabbitmq:3.13-management-alpine"));

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", postgres::getJdbcUrl);
        r.add("spring.datasource.username", postgres::getUsername);
        r.add("spring.datasource.password", postgres::getPassword);
        r.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        // Flyway owns the schema on real Postgres (matches the integration-hub harness); the test
        // profile's create-drop is for the H2 slice tests.
        r.add("spring.flyway.enabled", () -> "true");
        r.add("spring.jpa.hibernate.ddl-auto", () -> "none");

        r.add("spring.rabbitmq.host", rabbit::getHost);
        r.add("spring.rabbitmq.port", rabbit::getAmqpPort);
        r.add("spring.rabbitmq.username", rabbit::getAdminUsername);
        r.add("spring.rabbitmq.password", rabbit::getAdminPassword);
        // The test profile stops listeners auto-starting; this scenario needs the payments listener.
        r.add("spring.rabbitmq.listener.simple.auto-startup", () -> "true");
    }

    // @GrpcClient channels can't be created with the client auto-config excluded — mock the clients.
    @MockitoBean
    EmployeeGrpcClient employeeGrpcClient;
    @MockitoBean
    LeaveGrpcClient leaveGrpcClient;

    @Autowired
    RabbitTemplate rabbitTemplate;

    @Autowired
    PayrollRunRepository runRepository;

    @Test
    void duplicatePaymentsCompletedEvent_completesRunOnceWithoutRegression() {
        // Seed an APPROVED run (the transition path is covered by unit tests; this targets completion).
        PayrollRun run = PayrollRun.create(TENANT_ID, "2024-01", PayFrequency.MONTHLY, "hr-admin");
        ReflectionTestUtils.setField(run, "status", PayrollStatus.APPROVED);
        run = runRepository.save(run);
        UUID runId = run.getId();

        PaymentsCompletedEvent event = new PaymentsCompletedEvent(
                TENANT_ID, runId.toString(), 2L, 0L, new BigDecimal("110000"));

        // First delivery → run reaches COMPLETED.
        rabbitTemplate.convertAndSend("integration.events", "payments.completed", event);
        await(Duration.ofSeconds(20), () -> runRepository.findByIdAndTenantId(runId, TENANT_ID)
                .map(r -> r.getStatus() == PayrollStatus.COMPLETED).orElse(false));
        LocalDateTime completedAt = runRepository.findByIdAndTenantId(runId, TENANT_ID)
                .orElseThrow().getCompletedAt();
        assertThat(completedAt).isNotNull();

        // Duplicate delivery of the SAME event must be an idempotent no-op — no error, no regression.
        rabbitTemplate.convertAndSend("integration.events", "payments.completed", event);
        // The idempotent path never mutates a COMPLETED run, so completedAt must stay put. Assert it
        // holds over a window (long enough for the second message to be consumed).
        long deadline = System.currentTimeMillis() + Duration.ofSeconds(5).toMillis();
        while (System.currentTimeMillis() < deadline) {
            PayrollRun current = runRepository.findByIdAndTenantId(runId, TENANT_ID).orElseThrow();
            assertThat(current.getStatus()).isEqualTo(PayrollStatus.COMPLETED);
            assertThat(current.getCompletedAt()).isEqualTo(completedAt);
            sleep(250);
        }
    }

    private static void await(Duration timeout, BooleanSupplier condition) {
        long deadline = System.currentTimeMillis() + timeout.toMillis();
        while (System.currentTimeMillis() < deadline) {
            if (condition.getAsBoolean()) {
                return;
            }
            sleep(200);
        }
        fail("condition not met within " + timeout);
    }

    private static void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            fail("interrupted while waiting");
        }
    }
}
