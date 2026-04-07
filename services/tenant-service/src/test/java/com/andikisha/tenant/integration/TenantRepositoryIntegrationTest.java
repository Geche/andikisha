package com.andikisha.tenant.integration;

import com.andikisha.tenant.domain.model.Plan;
import com.andikisha.tenant.domain.model.Tenant;
import com.andikisha.tenant.domain.model.TenantStatus;
import com.andikisha.tenant.domain.repository.PlanRepository;
import com.andikisha.tenant.domain.repository.TenantRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.TestPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@Testcontainers(disabledWithoutDocker = true)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@TestPropertySource(properties = {
        "spring.flyway.enabled=true",
        "spring.jpa.hibernate.ddl-auto=validate"
})
@Import(com.andikisha.tenant.TenantServiceApplication.class)
class TenantRepositoryIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("andikisha_tenant_test")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void configureDataSource(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.url", postgres::getJdbcUrl);
        registry.add("spring.flyway.user", postgres::getUsername);
        registry.add("spring.flyway.password", postgres::getPassword);
    }

    @Autowired private TenantRepository tenantRepository;
    @Autowired private PlanRepository planRepository;
    @Autowired private TestEntityManager em;

    private Tenant buildAndSave(String company, String email, String phone) {
        Plan plan = planRepository.findByNameAndTenantId("Starter", "SYSTEM")
                .orElseThrow(() -> new IllegalStateException("Starter plan not seeded"));
        Tenant tenant = Tenant.create(company, "KE", "KES", email, phone, plan);
        return tenantRepository.save(tenant);
    }

    @Test
    void save_andFindById_roundTrips() {
        Tenant saved = buildAndSave("Test Corp", "admin@test.co.ke", "+254722000010");
        em.flush();
        em.clear();

        Optional<Tenant> found = tenantRepository.findByIdAndTenantId(
                saved.getId(), saved.getId().toString());

        assertThat(found).isPresent();
        assertThat(found.get().getCompanyName()).isEqualTo("Test Corp");
        assertThat(found.get().getAdminEmail()).isEqualTo("admin@test.co.ke");
        assertThat(found.get().getStatus()).isEqualTo(TenantStatus.TRIAL);
        // Auditing fields must be populated
        assertThat(found.get().getCreatedAt()).isNotNull();
        assertThat(found.get().getUpdatedAt()).isNotNull();
    }

    @Test
    void existsByAdminEmail_whenEmailExists_returnsTrue() {
        buildAndSave("Corp A", "unique@corp.co.ke", "+254722000011");
        em.flush();

        assertThat(tenantRepository.existsByAdminEmail("unique@corp.co.ke")).isTrue();
        assertThat(tenantRepository.existsByAdminEmail("noone@corp.co.ke")).isFalse();
    }

    @Test
    void existsByCompanyNameAndCountry_whenDuplicate_returnsTrue() {
        buildAndSave("Unique Corp", "owner@unique.co.ke", "+254722000012");
        em.flush();

        assertThat(tenantRepository.existsByCompanyNameAndCountry("Unique Corp", "KE")).isTrue();
        assertThat(tenantRepository.existsByCompanyNameAndCountry("Unique Corp", "UG")).isFalse();
    }

    @Test
    void findByStatus_returnsPaginatedResults() {
        buildAndSave("Trial Co 1", "trial1@co.ke", "+254722000013");
        buildAndSave("Trial Co 2", "trial2@co.ke", "+254722000014");
        em.flush();

        Page<Tenant> trials = tenantRepository.findByStatus(
                TenantStatus.TRIAL, PageRequest.of(0, 10));

        assertThat(trials.getContent()).allMatch(t -> t.getStatus() == TenantStatus.TRIAL);
        assertThat(trials.getTotalElements()).isGreaterThanOrEqualTo(2);
    }

    @Test
    void planRepository_findByNameAndTenantId_returnsSeedData() {
        Optional<Plan> starter = planRepository.findByNameAndTenantId("Starter", "SYSTEM");
        Optional<Plan> professional = planRepository.findByNameAndTenantId("Professional", "SYSTEM");
        Optional<Plan> enterprise = planRepository.findByNameAndTenantId("Enterprise", "SYSTEM");

        assertThat(starter).isPresent();
        assertThat(professional).isPresent();
        assertThat(enterprise).isPresent();
        assertThat(starter.get().getMonthlyPrice()).isNotNull();
        assertThat(starter.get().getMonthlyPrice().getAmount()).isPositive();
    }
}
