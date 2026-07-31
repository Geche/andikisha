package com.andikisha.integration.integration;

import com.andikisha.events.payroll.PaymentsCompletedEvent;
import com.andikisha.events.payroll.PayrollApprovedEvent;
import com.andikisha.integration.domain.model.PaymentTransaction;
import com.andikisha.integration.domain.model.TransactionStatus;
import com.andikisha.integration.domain.repository.PaymentTransactionRepository;
import com.andikisha.integration.infrastructure.payroll.PayrollServiceClient;
import com.andikisha.integration.infrastructure.payroll.PayrollServiceClient.PayslipDisbursementInfo;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.containers.RabbitMQContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.testcontainers.utility.DockerImageName;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.LinkedBlockingQueue;
import java.util.concurrent.TimeUnit;
import java.util.function.BooleanSupplier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.fail;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

/**
 * PAYROLL-BACKLOG-003 Scenario 1 — the full happy-path disbursement leg, exercised against a real
 * broker + database + Redis (the interactions unit tests mock away). A {@code PayrollApprovedEvent}
 * published to the {@code payroll.events} exchange must drive integration-hub to create payment
 * transactions, disburse them (sandbox auto-completes), and publish a terminal
 * {@code PaymentsCompletedEvent} back on {@code integration.events} — including the after-commit
 * publish (audit H-series bug #1) and the JSON {@code __TypeId__} round-trip (bug #2).
 *
 * <p>Only the cross-service read (payslip fetch, normally gRPC to payroll-service) is stubbed; M-Pesa
 * is the in-process {@code SandboxMpesaClient}. Harness architecture: see
 * {@code docs/decisions/2026-07-31-payroll-disbursement-integration-harness.md}.
 */
@SpringBootTest
@ActiveProfiles("test") // disables RedisPasswordStartupGuard (@Profile("!test"))
@Testcontainers(disabledWithoutDocker = true)
class PayrollDisbursementFlowTest {

    private static final String TENANT_ID = "it-tenant";
    private static final String FAIL_PHONE_PREFIX = "+254799";

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>(
            DockerImageName.parse("postgres:16-alpine"))
            .withDatabaseName("test_integration").withUsername("test").withPassword("test");

    @Container
    static RabbitMQContainer rabbit = new RabbitMQContainer(
            DockerImageName.parse("rabbitmq:3.13-management-alpine"));

    @Container
    static GenericContainer<?> redis = new GenericContainer<>(
            DockerImageName.parse("redis:7-alpine")).withExposedPorts(6379);

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url", postgres::getJdbcUrl);
        r.add("spring.datasource.username", postgres::getUsername);
        r.add("spring.datasource.password", postgres::getPassword);
        r.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        // Flyway owns the schema on real Postgres (the test profile disables it for H2 slices).
        r.add("spring.flyway.enabled", () -> "true");
        r.add("spring.jpa.hibernate.ddl-auto", () -> "none");

        r.add("spring.rabbitmq.host", rabbit::getHost);
        r.add("spring.rabbitmq.port", rabbit::getAmqpPort);
        r.add("spring.rabbitmq.username", rabbit::getAdminUsername);
        r.add("spring.rabbitmq.password", rabbit::getAdminPassword);
        // The test profile stops listeners auto-starting; this scenario needs them consuming.
        r.add("spring.rabbitmq.listener.simple.auto-startup", () -> "true");

        r.add("spring.data.redis.host", redis::getHost);
        r.add("spring.data.redis.port", () -> redis.getMappedPort(6379));

        r.add("app.mpesa.enabled", () -> "false"); // sandbox — SandboxMpesaClient auto-completes
        // Scenario 2: any payslip phone starting with this prefix fails in the sandbox. Scenario 1's
        // phones (+254700…) never match, so the happy path is unaffected.
        r.add("app.mpesa.sandbox.fail-phone-prefix", () -> FAIL_PHONE_PREFIX);
        r.add("app.credential-encryption-key", () -> "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=");
        r.add("grpc.server.port", () -> "0");
    }

    private static final String CAPTURE_QUEUE = "it.capture.payments-completed";

    /**
     * Captures the terminal event through a real {@code @RabbitListener} — the converter is configured
     * with INFERRED type precedence, so it needs the listener parameter type to deserialize (a raw
     * {@code receiveAndConvert} can't infer it). This also exercises the real consumption path.
     */
    @TestConfiguration
    static class CompletedEventCapture {
        final BlockingQueue<PaymentsCompletedEvent> events = new LinkedBlockingQueue<>();

        @Bean
        Queue capturePaymentsCompletedQueue() {
            return new Queue(CAPTURE_QUEUE, false, false, true);
        }

        @Bean
        Binding capturePaymentsCompletedBinding(Queue capturePaymentsCompletedQueue) {
            return BindingBuilder.bind(capturePaymentsCompletedQueue)
                    .to(new TopicExchange("integration.events")).with("payments.completed");
        }

        @RabbitListener(queues = CAPTURE_QUEUE)
        void onPaymentsCompleted(PaymentsCompletedEvent event) {
            events.add(event);
        }
    }

    @MockitoBean
    PayrollServiceClient payrollClient;

    @Autowired
    RabbitTemplate rabbitTemplate;

    @Autowired
    PaymentTransactionRepository transactionRepository;

    @Autowired
    com.andikisha.integration.application.service.PaymentService paymentService;

    @Autowired
    CompletedEventCapture completedEventCapture;

    @Test
    void payrollApproved_sandbox_disbursesEveryPayslipAndPublishesPaymentsCompleted() {
        UUID runId = UUID.randomUUID();
        List<PayslipDisbursementInfo> payslips = List.of(
                new PayslipDisbursementInfo(UUID.randomUUID().toString(), UUID.randomUUID().toString(),
                        "Jane Doe", "EMP-0001", new BigDecimal("50000.00"), "KES", "+254700000001"),
                new PayslipDisbursementInfo(UUID.randomUUID().toString(), UUID.randomUUID().toString(),
                        "John Roe", "EMP-0002", new BigDecimal("60000.00"), "KES", "+254700000002"));
        when(payrollClient.getPayslipsForRun(eq(TENANT_ID), eq(runId))).thenReturn(payslips);

        PayrollApprovedEvent event = new PayrollApprovedEvent(
                TENANT_ID, runId.toString(), "2024-01", 2,
                new BigDecimal("140000"), new BigDecimal("110000"), new BigDecimal("20000"),
                new BigDecimal("5000"), new BigDecimal("3850"), new BigDecimal("1650"), "hr-admin");

        rabbitTemplate.convertAndSend("payroll.events", "payroll.approved", event);

        // Both transactions reach COMPLETED (sandbox auto-completes after the async send).
        await(Duration.ofSeconds(20), () -> {
            var txns = transactionRepository.findByTenantIdAndPayrollRunId(TENANT_ID, runId);
            return txns.size() == 2
                    && txns.stream().allMatch(t -> t.getStatus() == TransactionStatus.COMPLETED);
        });

        // The terminal PaymentsCompletedEvent is published on integration.events and round-trips
        // through the JSON converter + a real listener (exercises the deserialization path).
        PaymentsCompletedEvent completed = awaitCompletedEvent(runId, Duration.ofSeconds(15));
        assertThat(completed).as("terminal PaymentsCompletedEvent").isNotNull();
        assertThat(completed.getCountSuccessful()).isEqualTo(2);
        assertThat(completed.getCountFailed()).isEqualTo(0);
    }

    @Test
    void payrollApproved_oneFailingPayslip_runCompletesWithSplitCounts() {
        // Scenario 2 — partial failure: one payslip's phone matches the sandbox fail prefix, so its
        // disbursement FAILS while the other COMPLETES. The run must still reach a terminal
        // PaymentsCompletedEvent, with counts split 1 success / 1 failure.
        UUID runId = UUID.randomUUID();
        List<PayslipDisbursementInfo> payslips = List.of(
                new PayslipDisbursementInfo(UUID.randomUUID().toString(), UUID.randomUUID().toString(),
                        "Ada Ok", "EMP-0101", new BigDecimal("50000.00"), "KES", "+254700000010"),
                new PayslipDisbursementInfo(UUID.randomUUID().toString(), UUID.randomUUID().toString(),
                        "Ben No", "EMP-0102", new BigDecimal("60000.00"), "KES", FAIL_PHONE_PREFIX + "000010"));
        when(payrollClient.getPayslipsForRun(eq(TENANT_ID), eq(runId))).thenReturn(payslips);

        PayrollApprovedEvent event = new PayrollApprovedEvent(
                TENANT_ID, runId.toString(), "2024-02", 2,
                new BigDecimal("140000"), new BigDecimal("110000"), new BigDecimal("20000"),
                new BigDecimal("5000"), new BigDecimal("3850"), new BigDecimal("1650"), "hr-admin");

        rabbitTemplate.convertAndSend("payroll.events", "payroll.approved", event);

        // Both transactions reach a terminal state: exactly one COMPLETED and one FAILED.
        await(Duration.ofSeconds(20), () -> {
            var txns = transactionRepository.findByTenantIdAndPayrollRunId(TENANT_ID, runId);
            if (txns.size() != 2) {
                return false;
            }
            long completed = txns.stream().filter(t -> t.getStatus() == TransactionStatus.COMPLETED).count();
            long failed = txns.stream().filter(t -> t.getStatus() == TransactionStatus.FAILED).count();
            return completed == 1 && failed == 1;
        });

        PaymentsCompletedEvent completed = awaitCompletedEvent(runId, Duration.ofSeconds(15));
        assertThat(completed).as("terminal PaymentsCompletedEvent for partial-failure run").isNotNull();
        assertThat(completed.getCountSuccessful()).isEqualTo(1);
        assertThat(completed.getCountFailed()).isEqualTo(1);
    }

    @Test
    void retryOnFullyCompletedRun_doesNotReDispatch() {
        // Scenario 3 — retry/double-send idempotency: re-triggering disbursement (e.g. a second
        // "disburse" click, here a retryFailed call) on a run whose payments already COMPLETED must NOT
        // re-dispatch them. retryFailed only touches FAILED transactions, and the H3 anti-double-send
        // guard makes a settled transaction non-dispatchable. (Note: the completion event itself is
        // NOT single-fire at integration-hub — maybePublishRunCompleted runs per transaction commit, so
        // it can publish more than once; payroll's PayrollRun.complete() idempotency dedups that. So we
        // assert on transaction state, not event count.)
        UUID runId = UUID.randomUUID();
        List<PayslipDisbursementInfo> payslips = List.of(
                new PayslipDisbursementInfo(UUID.randomUUID().toString(), UUID.randomUUID().toString(),
                        "Cy Done", "EMP-0201", new BigDecimal("50000.00"), "KES", "+254700000020"),
                new PayslipDisbursementInfo(UUID.randomUUID().toString(), UUID.randomUUID().toString(),
                        "Di Done", "EMP-0202", new BigDecimal("60000.00"), "KES", "+254700000021"));
        when(payrollClient.getPayslipsForRun(eq(TENANT_ID), eq(runId))).thenReturn(payslips);

        PayrollApprovedEvent event = new PayrollApprovedEvent(
                TENANT_ID, runId.toString(), "2024-03", 2,
                new BigDecimal("140000"), new BigDecimal("110000"), new BigDecimal("20000"),
                new BigDecimal("5000"), new BigDecimal("3850"), new BigDecimal("1650"), "hr-admin");
        rabbitTemplate.convertAndSend("payroll.events", "payroll.approved", event);

        await(Duration.ofSeconds(20), () -> {
            var txns = transactionRepository.findByTenantIdAndPayrollRunId(TENANT_ID, runId);
            return txns.size() == 2
                    && txns.stream().allMatch(t -> t.getStatus() == TransactionStatus.COMPLETED);
        });
        assertThat(awaitCompletedEvent(runId, Duration.ofSeconds(15)))
                .as("initial completion event").isNotNull();

        // Capture the conversation ids assigned at first dispatch — a re-dispatch would mint new ones.
        Map<UUID, String> conversationBefore = transactionRepository
                .findByTenantIdAndPayrollRunId(TENANT_ID, runId).stream()
                .collect(Collectors.toMap(PaymentTransaction::getId, PaymentTransaction::getConversationId));

        // Re-trigger disbursement — a safe no-op (no FAILED transactions; settled ones are non-dispatchable).
        paymentService.retryFailed(TENANT_ID, runId);

        var after = transactionRepository.findByTenantIdAndPayrollRunId(TENANT_ID, runId);
        assertThat(after).hasSize(2);
        assertThat(after).allMatch(t -> t.getStatus() == TransactionStatus.COMPLETED);
        // No transaction was re-dispatched: conversation ids are unchanged.
        assertThat(after).allSatisfy(t ->
                assertThat(t.getConversationId()).isEqualTo(conversationBefore.get(t.getId())));
    }

    /** Waits for the terminal event of a specific run, ignoring events from other scenarios' runs. */
    private PaymentsCompletedEvent awaitCompletedEvent(UUID runId, Duration timeout) {
        long deadline = System.currentTimeMillis() + timeout.toMillis();
        while (System.currentTimeMillis() < deadline) {
            try {
                PaymentsCompletedEvent e = completedEventCapture.events.poll(500, TimeUnit.MILLISECONDS);
                if (e != null && e.getPayrollRunId().equals(runId.toString())) {
                    return e;
                }
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                throw new AssertionError("interrupted awaiting PaymentsCompletedEvent", ie);
            }
        }
        return null;
    }

    private static void await(Duration timeout, BooleanSupplier condition) {
        long deadline = System.currentTimeMillis() + timeout.toMillis();
        while (System.currentTimeMillis() < deadline) {
            if (condition.getAsBoolean()) {
                return;
            }
            try {
                Thread.sleep(200);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                fail("interrupted while awaiting condition");
            }
        }
        fail("condition not met within " + timeout);
    }
}
