package com.andikisha.compliance.integration;

import com.andikisha.compliance.domain.model.Country;
import com.andikisha.compliance.domain.model.TaxBracket;
import com.andikisha.compliance.domain.repository.TaxBracketRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

// @DataJpaTest wraps every test method in a transaction that is rolled back after the
// test. This means rows saved during a test are never visible to other tests, and the
// Flyway V4 seed data (5 KE brackets) is always present at the start of each test.
// No @BeforeEach deleteAll() is needed or desirable — a full-table delete without a
// WHERE clause is never safe to use as boilerplate.
@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers(disabledWithoutDocker = true)
@Import(FlywayAutoConfiguration.class)
class TaxBracketRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("test_compliance")
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
    TaxBracketRepository repository;

    // ------------------------------------------------------------------
    // Kenya PAYE bracket seed data (from V4__seed_kenya_rates.sql)
    // These tests rely on Flyway seed rows — no manual save() needed.
    // ------------------------------------------------------------------

    @Test
    void findActiveByCountryAndDate_keReturnsAllFiveBands() {
        List<TaxBracket> result = repository.findActiveByCountryAndDate(
                Country.KE, LocalDate.of(2025, 1, 1));
        assertThat(result).hasSize(5);
    }

    @Test
    void findActiveByCountryAndDate_returnsBandsInBandNumberOrder() {
        List<TaxBracket> result = repository.findActiveByCountryAndDate(
                Country.KE, LocalDate.of(2025, 1, 1));
        List<Integer> bandNumbers = result.stream().map(TaxBracket::getBandNumber).toList();
        assertThat(bandNumbers).isSorted();
    }

    @Test
    void findActiveByCountryAndDate_band1_boundsAndRate() {
        TaxBracket band1 = repository.findActiveByCountryAndDate(
                Country.KE, LocalDate.of(2025, 1, 1)).get(0);
        assertThat(band1.getLowerBound()).isEqualByComparingTo("0");
        assertThat(band1.getUpperBound()).isEqualByComparingTo("24000");
        assertThat(band1.getRate()).isEqualByComparingTo("0.10");
    }

    @Test
    void findActiveByCountryAndDate_band2_upperBoundIs32300() {
        // Regression guard: KRA-correct boundary is KES 32,300 (not the wrong 32,333)
        TaxBracket band2 = repository.findActiveByCountryAndDate(
                Country.KE, LocalDate.of(2025, 1, 1)).get(1);
        assertThat(band2.getUpperBound()).isEqualByComparingTo("32300");
        assertThat(band2.getRate()).isEqualByComparingTo("0.25");
    }

    @Test
    void findActiveByCountryAndDate_band5_topBracketHasNoUpperBound() {
        List<TaxBracket> all = repository.findActiveByCountryAndDate(
                Country.KE, LocalDate.of(2025, 1, 1));
        TaxBracket band5 = all.get(all.size() - 1);
        assertThat(band5.getUpperBound()).isNull();
        assertThat(band5.getRate()).isEqualByComparingTo("0.35");
    }

    // ------------------------------------------------------------------
    // Date range filtering — use Country.UG (no seed data) to avoid
    // any interaction with the KE seed rows.
    // ------------------------------------------------------------------

    @Test
    void findActiveByCountryAndDate_beforeEffectiveFrom_returnsNothing() {
        repository.save(ugBracket(LocalDate.of(2024, 7, 1), null));

        List<TaxBracket> result = repository.findActiveByCountryAndDate(
                Country.UG, LocalDate.of(2024, 6, 30));

        assertThat(result).isEmpty();
    }

    @Test
    void findActiveByCountryAndDate_onEffectiveFromDate_isIncluded() {
        LocalDate effectiveFrom = LocalDate.of(2024, 7, 1);
        repository.save(ugBracket(effectiveFrom, null));

        List<TaxBracket> result = repository.findActiveByCountryAndDate(
                Country.UG, effectiveFrom);

        assertThat(result).hasSize(1);
    }

    @Test
    void findActiveByCountryAndDate_afterEffectiveTo_returnsNothing() {
        TaxBracket expired = ugBracket(LocalDate.of(2024, 1, 1), null);
        expired.expire(LocalDate.of(2024, 6, 30));
        repository.save(expired);

        List<TaxBracket> result = repository.findActiveByCountryAndDate(
                Country.UG, LocalDate.of(2025, 1, 1));

        assertThat(result).isEmpty();
    }

    // ------------------------------------------------------------------
    // Country isolation
    // ------------------------------------------------------------------

    @Test
    void findActiveByCountryAndDate_doesNotReturnOtherCountryBrackets() {
        // KE seed rows exist; querying for UG must return nothing
        List<TaxBracket> result = repository.findActiveByCountryAndDate(
                Country.UG, LocalDate.of(2025, 1, 1));
        assertThat(result).isEmpty();
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private TaxBracket ugBracket(LocalDate effectiveFrom, LocalDate effectiveTo) {
        TaxBracket b = TaxBracket.create("SYSTEM", Country.UG, 1,
                BigDecimal.ZERO, new BigDecimal("100000"),
                new BigDecimal("0.10"), effectiveFrom);
        if (effectiveTo != null) b.expire(effectiveTo);
        return b;
    }
}
