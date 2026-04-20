package com.andikisha.document.integration;

import com.andikisha.document.domain.model.Document;
import com.andikisha.document.domain.model.DocumentStatus;
import com.andikisha.document.domain.model.DocumentType;
import com.andikisha.document.domain.repository.DocumentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers(disabledWithoutDocker = true)
@Import(FlywayAutoConfiguration.class)
class DocumentRepositoryTest {

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
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("spring.flyway.locations", () -> "classpath:db/migration");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
    }

    @Autowired
    DocumentRepository repository;

    private static final String TENANT_A  = "tenant-alpha";
    private static final String TENANT_B  = "tenant-beta";
    private static final UUID   EMPLOYEE  = UUID.randomUUID();
    private static final UUID   PAYROLL_RUN = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    // -------------------------------------------------------------------------
    // Tenant isolation
    // -------------------------------------------------------------------------

    @Test
    void findByIdAndTenantId_enforcesTenantIsolation() {
        Document doc = repository.save(payslip(TENANT_A, EMPLOYEE));

        assertThat(repository.findByIdAndTenantId(doc.getId(), TENANT_A)).isPresent();
        assertThat(repository.findByIdAndTenantId(doc.getId(), TENANT_B)).isEmpty();
    }

    @Test
    void findByTenantIdOrderByCreatedAtDesc_excludesOtherTenants() {
        repository.save(payslip(TENANT_A, EMPLOYEE));
        repository.save(payslip(TENANT_B, UUID.randomUUID()));

        Page<Document> page = repository.findByTenantIdOrderByCreatedAtDesc(
                TENANT_A, PageRequest.of(0, 10));

        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getContent()).allMatch(d -> TENANT_A.equals(d.getTenantId()));
    }

    @Test
    void findByTenantIdAndEmployeeId_returnsOnlyThatEmployee() {
        UUID otherEmployee = UUID.randomUUID();
        repository.save(payslip(TENANT_A, EMPLOYEE));
        repository.save(payslip(TENANT_A, otherEmployee));

        Page<Document> page = repository.findByTenantIdAndEmployeeIdOrderByCreatedAtDesc(
                TENANT_A, EMPLOYEE, PageRequest.of(0, 10));

        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getContent().get(0).getEmployeeId()).isEqualTo(EMPLOYEE);
    }

    // -------------------------------------------------------------------------
    // findByTenantIdAndDocumentType
    // -------------------------------------------------------------------------

    @Test
    void findByTenantIdAndDocumentType_filtersCorrectly() {
        Document payslip  = payslip(TENANT_A, EMPLOYEE);
        Document contract = contract(TENANT_A, EMPLOYEE);
        repository.saveAll(List.of(payslip, contract));

        Page<Document> page = repository.findByTenantIdAndDocumentTypeOrderByCreatedAtDesc(
                TENANT_A, DocumentType.PAYSLIP, PageRequest.of(0, 10));

        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getContent().get(0).getDocumentType()).isEqualTo(DocumentType.PAYSLIP);
    }

    // -------------------------------------------------------------------------
    // findByTenantIdAndPayrollRunId
    // -------------------------------------------------------------------------

    @Test
    void findByTenantIdAndPayrollRunId_returnsSameRunOnly() {
        Document forRun    = payslipForRun(TENANT_A, EMPLOYEE, PAYROLL_RUN);
        Document otherRun  = payslipForRun(TENANT_A, EMPLOYEE, UUID.randomUUID());
        repository.saveAll(List.of(forRun, otherRun));

        List<Document> results = repository.findByTenantIdAndPayrollRunId(TENANT_A, PAYROLL_RUN);

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getPayrollRunId()).isEqualTo(PAYROLL_RUN);
    }

    @Test
    void findByTenantIdAndPayrollRunId_tenantIsolation() {
        repository.save(payslipForRun(TENANT_A, EMPLOYEE, PAYROLL_RUN));

        List<Document> tenantBResults = repository.findByTenantIdAndPayrollRunId(TENANT_B, PAYROLL_RUN);

        assertThat(tenantBResults).isEmpty();
    }

    // -------------------------------------------------------------------------
    // findByTenantIdAndEmployeeIdAndDocumentTypeAndPeriod
    // -------------------------------------------------------------------------

    @Test
    void findByTenantIdAndEmployeeIdAndDocumentTypeAndPeriod_exactMatch() {
        Document doc = payslip(TENANT_A, EMPLOYEE);
        doc.setPeriod("2024-04");
        repository.save(doc);

        Optional<Document> found = repository.findByTenantIdAndEmployeeIdAndDocumentTypeAndPeriod(
                TENANT_A, EMPLOYEE, DocumentType.PAYSLIP, "2024-04");

        assertThat(found).isPresent();
    }

    @Test
    void findByTenantIdAndEmployeeIdAndDocumentTypeAndPeriod_wrongPeriod_returnsEmpty() {
        Document doc = payslip(TENANT_A, EMPLOYEE);
        doc.setPeriod("2024-04");
        repository.save(doc);

        Optional<Document> found = repository.findByTenantIdAndEmployeeIdAndDocumentTypeAndPeriod(
                TENANT_A, EMPLOYEE, DocumentType.PAYSLIP, "2024-03");

        assertThat(found).isEmpty();
    }

    // -------------------------------------------------------------------------
    // markReady status transition
    // -------------------------------------------------------------------------

    @Test
    void markReady_updatesStatusAndFileSize() {
        Document doc = repository.save(payslip(TENANT_A, EMPLOYEE));
        assertThat(doc.getStatus()).isEqualTo(DocumentStatus.GENERATING);

        doc.markReady(8192L);
        Document saved = repository.save(doc);

        assertThat(saved.getStatus()).isEqualTo(DocumentStatus.READY);
        assertThat(saved.getFileSize()).isEqualTo(8192L);
        assertThat(saved.getGeneratedAt()).isNotNull();
    }

    @Test
    void markFailed_updatesStatusAndErrorMessage() {
        Document doc = repository.save(payslip(TENANT_A, EMPLOYEE));

        doc.markFailed("PDF renderer OOM");
        Document saved = repository.save(doc);

        assertThat(saved.getStatus()).isEqualTo(DocumentStatus.FAILED);
        assertThat(saved.getErrorMessage()).isEqualTo("PDF renderer OOM");
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private Document payslip(String tenantId, UUID employeeId) {
        return Document.create(tenantId, employeeId, "Test Employee",
                DocumentType.PAYSLIP, "Payslip Apr-2024",
                "payslip_EMP001_2024-04.pdf",
                tenantId + "/payslips/2024-04/payslip_EMP001_2024-04.pdf",
                "application/pdf");
    }

    private Document contract(String tenantId, UUID employeeId) {
        return Document.create(tenantId, employeeId, "Test Employee",
                DocumentType.CONTRACT, "Employment Contract",
                "contract_EMP001.pdf",
                tenantId + "/contracts/contract_EMP001.pdf",
                "application/pdf");
    }

    private Document payslipForRun(String tenantId, UUID employeeId, UUID payrollRunId) {
        Document doc = payslip(tenantId, employeeId);
        doc.setPayrollRunId(payrollRunId);
        return doc;
    }
}
