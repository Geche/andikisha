package com.andikisha.integration.integration;

import com.andikisha.integration.domain.model.FilingRecord;
import com.andikisha.integration.domain.model.IntegrationType;
import com.andikisha.integration.domain.repository.FilingRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class FilingRecordRepositoryTest {

    @Autowired FilingRecordRepository repository;

    private static final String TENANT_A = "tenant-alpha";
    private static final String TENANT_B = "tenant-beta";

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    @Test
    void findByTenantIdAndFilingTypeAndPeriod_enforcesTenantIsolation() {
        repository.save(buildPaye(TENANT_A, "2024-01"));

        assertThat(repository.findByTenantIdAndFilingTypeAndPeriod(
                TENANT_A, IntegrationType.KRA_ITAX, "2024-01")).isPresent();
        assertThat(repository.findByTenantIdAndFilingTypeAndPeriod(
                TENANT_B, IntegrationType.KRA_ITAX, "2024-01")).isEmpty();
    }

    @Test
    void findByTenantIdAndFilingTypeAndPeriod_distinguishesByType() {
        repository.save(buildPaye(TENANT_A, "2024-01"));

        assertThat(repository.findByTenantIdAndFilingTypeAndPeriod(
                TENANT_A, IntegrationType.KRA_ITAX, "2024-01")).isPresent();
        assertThat(repository.findByTenantIdAndFilingTypeAndPeriod(
                TENANT_A, IntegrationType.NSSF_REMITTANCE, "2024-01")).isEmpty();
    }

    @Test
    void findByIdAndTenantId_enforcesTenantIsolation() {
        FilingRecord record = repository.save(buildPaye(TENANT_A, "2024-02"));

        assertThat(repository.findByIdAndTenantId(record.getId(), TENANT_A)).isPresent();
        assertThat(repository.findByIdAndTenantId(record.getId(), TENANT_B)).isEmpty();
    }

    @Test
    void findByTenantIdOrderByCreatedAtDesc_excludesOtherTenants() {
        repository.save(buildPaye(TENANT_A, "2024-03"));
        repository.save(buildPaye(TENANT_B, "2024-03"));

        Page<FilingRecord> page = repository.findByTenantIdOrderByCreatedAtDesc(
                TENANT_A, PageRequest.of(0, 10));

        assertThat(page.getContent()).hasSize(1);
        assertThat(page.getContent().get(0).getTenantId()).isEqualTo(TENANT_A);
    }

    @Test
    void findByTenantIdAndFilingTypeOrderByPeriodDesc_returnsCorrectType() {
        repository.save(buildPaye(TENANT_A, "2024-01"));
        repository.save(buildPaye(TENANT_A, "2024-02"));
        repository.save(FilingRecord.create(TENANT_A, IntegrationType.NSSF_REMITTANCE,
                "2024-01", 5, new BigDecimal("10800"), new BigDecimal("10800")));

        Page<FilingRecord> page = repository.findByTenantIdAndFilingTypeOrderByPeriodDesc(
                TENANT_A, IntegrationType.KRA_ITAX, PageRequest.of(0, 10));

        assertThat(page.getContent()).hasSize(2);
        assertThat(page.getContent().get(0).getPeriod()).isEqualTo("2024-02");
        assertThat(page.getContent().get(1).getPeriod()).isEqualTo("2024-01");
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private FilingRecord buildPaye(String tenantId, String period) {
        return FilingRecord.create(tenantId, IntegrationType.KRA_ITAX,
                period, 10, new BigDecimal("150000"), BigDecimal.ZERO);
    }
}
