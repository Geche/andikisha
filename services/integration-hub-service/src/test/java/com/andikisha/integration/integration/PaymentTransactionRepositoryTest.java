package com.andikisha.integration.integration;

import com.andikisha.integration.domain.model.PaymentMethod;
import com.andikisha.integration.domain.model.PaymentTransaction;
import com.andikisha.integration.domain.model.TransactionStatus;
import com.andikisha.integration.domain.repository.PaymentTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers(disabledWithoutDocker = true)
@Import(FlywayAutoConfiguration.class)
class PaymentTransactionRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("test_integration")
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
        registry.add("app.credential-encryption-key", () -> "");
    }

    @Autowired PaymentTransactionRepository repository;

    private static final String TENANT_A   = "tenant-alpha";
    private static final String TENANT_B   = "tenant-beta";
    private static final UUID   RUN_ID     = UUID.randomUUID();
    private static final String CONV_ID    = "AG_CONV123456789";

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    @Test
    void findByIdAndTenantId_enforcesTenantIsolation() {
        PaymentTransaction tx = repository.save(buildTx(TENANT_A, PaymentMethod.MPESA));

        assertThat(repository.findByIdAndTenantId(tx.getId(), TENANT_A)).isPresent();
        assertThat(repository.findByIdAndTenantId(tx.getId(), TENANT_B)).isEmpty();
    }

    @Test
    void findByConversationId_returnsCorrectTransaction() {
        PaymentTransaction tx = buildTx(TENANT_A, PaymentMethod.MPESA);
        tx.markSubmitted("PAY-REF-001", CONV_ID);
        repository.save(tx);

        assertThat(repository.findByConversationId(CONV_ID)).isPresent();
        assertThat(repository.findByConversationId("AG_UNKNOWN")).isEmpty();
    }

    @Test
    void findByTenantIdAndPayrollRunIdAndStatus_filtersCorrectly() {
        PaymentTransaction pending  = buildTx(TENANT_A, PaymentMethod.MPESA);
        PaymentTransaction failed   = buildTx(TENANT_A, PaymentMethod.BANK_TRANSFER);
        failed.markFailed("ERR", "timeout");
        repository.saveAll(List.of(pending, failed));

        List<PaymentTransaction> results = repository
                .findByTenantIdAndPayrollRunIdAndStatus(TENANT_A, RUN_ID, TransactionStatus.PENDING);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getStatus()).isEqualTo(TransactionStatus.PENDING);
    }

    @Test
    void findByTenantIdAndPayrollRunIdAndStatus_isolatesByTenant() {
        repository.save(buildTx(TENANT_A, PaymentMethod.MPESA));
        repository.save(buildTx(TENANT_B, PaymentMethod.MPESA));

        List<PaymentTransaction> results = repository
                .findByTenantIdAndPayrollRunIdAndStatus(TENANT_A, RUN_ID, TransactionStatus.PENDING);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getTenantId()).isEqualTo(TENANT_A);
    }

    @Test
    void findByTenantIdAndPayrollRunId_returnsAllStatusesForRun() {
        PaymentTransaction tx1 = buildTx(TENANT_A, PaymentMethod.MPESA);
        PaymentTransaction tx2 = buildTx(TENANT_A, PaymentMethod.BANK_TRANSFER);
        tx2.markSubmitted("REF", "CONV-BANK");
        tx2.markCompleted("RECEIPT-001");
        repository.saveAll(List.of(tx1, tx2));

        List<PaymentTransaction> all = repository.findByTenantIdAndPayrollRunId(TENANT_A, RUN_ID);

        assertThat(all).hasSize(2);
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private PaymentTransaction buildTx(String tenantId, PaymentMethod method) {
        return PaymentTransaction.create(
                tenantId, RUN_ID, UUID.randomUUID(), UUID.randomUUID(),
                "Test Employee", method,
                method == PaymentMethod.MPESA ? "+254700000001" : null,
                method == PaymentMethod.BANK_TRANSFER ? "KCB" : null,
                method == PaymentMethod.BANK_TRANSFER ? "1234567890" : null,
                new BigDecimal("50000.00"), "KES");
    }
}
