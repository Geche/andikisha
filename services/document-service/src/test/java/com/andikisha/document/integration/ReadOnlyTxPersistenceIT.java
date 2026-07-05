package com.andikisha.document.integration;

import com.andikisha.document.application.service.DocumentPersistenceHelper;
import com.andikisha.document.domain.model.Document;
import com.andikisha.document.domain.model.DocumentStatus;
import com.andikisha.document.domain.model.DocumentType;
import com.andikisha.document.domain.repository.DocumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Regression guard for the async-generator persistence bug fixed in #66 (issue #67).
 *
 * <p>The generators (payslip #38, Certificate of Service #56/#57) historically carried a
 * class-level {@code @Transactional(readOnly = true)}. Their status writes go through
 * {@link DocumentPersistenceHelper}; if those helper methods lose {@code REQUIRES_NEW}, the write
 * joins the caller's read-only transaction and is <b>silently discarded on Postgres</b> — the
 * document row never reaches READY/DRAFT even though generation "succeeded".
 *
 * <p>This was invisible to the existing suite: unit tests mock the helper, and the {@code test}
 * profile uses H2, which does not honour {@code Connection.setReadOnly(true)} the way Postgres does,
 * so the write is NOT discarded on H2. Only a real Postgres surfaces it — hence Testcontainers here.
 *
 * <p>{@link ReadOnlyGeneratorSimulator} reproduces the generators' outer read-only transaction; each
 * test asserts the helper write actually persisted. Revert any helper method to {@code REQUIRED}
 * (or drop the annotation) and these tests fail on Postgres, exactly where the production bug lived.
 */
@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers(disabledWithoutDocker = true)
@Import({DocumentPersistenceHelper.class, ReadOnlyTxPersistenceIT.ReadOnlyGeneratorSimulator.class})
// Opt out of @DataJpaTest's ambient rollback transaction: the read-only caller, the helper's
// REQUIRES_NEW commits, and the fresh read-backs must behave exactly as they do in production,
// with no test-managed transaction papering over the read-only-discard.
@Transactional(propagation = Propagation.NOT_SUPPORTED)
class ReadOnlyTxPersistenceIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("test_document")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");
        registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.PostgreSQLDialect");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
        registry.add("spring.flyway.enabled", () -> "false");
    }

    @Autowired DocumentRepository repository;
    @Autowired ReadOnlyGeneratorSimulator simulator;

    private static final String TENANT   = "tenant-rotx";
    private static final UUID   EMPLOYEE = UUID.randomUUID();

    @BeforeEach
    void clean() {
        // Precondition guard: the whole test is only meaningful with NO ambient transaction, so the
        // read-only caller opens its own genuinely read-only tx (readOnly is ignored on a joined tx).
        // If the @DataJpaTest rollback tx ever leaks back in, fail loudly here rather than pass vacuously.
        assertThat(TransactionSynchronizationManager.isActualTransactionActive())
                .as("test must run without an ambient transaction (NOT_SUPPORTED opt-out)")
                .isFalse();
        // No ambient transaction means no rollback — clean up explicitly.
        repository.deleteAll();
    }

    @Test
    void createGenerating_fromReadOnlyGeneratorTx_persistsOnPostgres() {
        UUID id = simulator.createGeneratingWithinReadOnlyTx();

        assertThat(repository.findById(id))
                .as("createGenerating write must escape the generator's read-only tx (#66/#67)")
                .isPresent()
                .get()
                .extracting(Document::getStatus)
                .isEqualTo(DocumentStatus.GENERATING);
    }

    @Test
    void markReady_fromReadOnlyGeneratorTx_persistsOnPostgres() {
        UUID id = repository.save(generating(DocumentType.PAYSLIP, "payslip_EMP001_2026-06.pdf")).getId();

        simulator.markReadyWithinReadOnlyTx(id, 8192L);

        Document reloaded = repository.findById(id).orElseThrow();
        assertThat(reloaded.getStatus())
                .as("payslip markReady must persist despite the read-only generator tx (#38/#66)")
                .isEqualTo(DocumentStatus.READY);
        assertThat(reloaded.getFileSize()).isEqualTo(8192L);
        assertThat(reloaded.getGeneratedAt()).isNotNull();
    }

    @Test
    void markDraft_fromReadOnlyGeneratorTx_persistsOnPostgres() {
        UUID id = repository.save(
                generating(DocumentType.CERTIFICATE_OF_SERVICE, "certificate_of_service_EMP001.pdf")).getId();

        simulator.markDraftWithinReadOnlyTx(id, 3210L);

        Document reloaded = repository.findById(id).orElseThrow();
        assertThat(reloaded.getStatus())
                .as("certificate markDraft must persist despite the read-only generator tx (#56/#57/#66)")
                .isEqualTo(DocumentStatus.DRAFT);
        assertThat(reloaded.getFileSize()).isEqualTo(3210L);
        assertThat(reloaded.getGeneratedAt()).isNotNull();
    }

    private Document generating(DocumentType type, String fileName) {
        return Document.create(TENANT, EMPLOYEE, "Test Employee", type,
                "Test document", fileName, TENANT + "/" + fileName, "application/pdf");
    }

    /**
     * Stands in for a generator's outer {@code @Transactional(readOnly = true)} context. Because the
     * helper is a distinct bean, its {@code REQUIRES_NEW} methods are invoked through the Spring proxy
     * and suspend this read-only transaction — the write commits independently, as in production.
     * Methods are public so the transactional advisor applies.
     */
    static class ReadOnlyGeneratorSimulator {

        private final DocumentPersistenceHelper helper;

        ReadOnlyGeneratorSimulator(DocumentPersistenceHelper helper) {
            this.helper = helper;
        }

        @Transactional(readOnly = true)
        public UUID createGeneratingWithinReadOnlyTx() {
            return helper.createGenerating(TENANT, EMPLOYEE, "Test Employee",
                    DocumentType.PAYSLIP, "Test document", "payslip_EMP001_2026-06.pdf",
                    TENANT + "/payslip_EMP001_2026-06.pdf", "application/pdf",
                    "2026-06", null, "SYSTEM").getId();
        }

        @Transactional(readOnly = true)
        public void markReadyWithinReadOnlyTx(UUID documentId, long fileSize) {
            helper.markReady(documentId, fileSize);
        }

        @Transactional(readOnly = true)
        public void markDraftWithinReadOnlyTx(UUID documentId, long fileSize) {
            helper.markDraft(documentId, fileSize);
        }
    }
}
