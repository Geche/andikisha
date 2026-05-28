package com.andikisha.tenant.integration;

import com.andikisha.common.domain.model.BillingCycle;
import com.andikisha.common.domain.model.LicenceStatus;
import com.andikisha.tenant.application.service.LicencePlanService;
import com.andikisha.tenant.domain.model.LicenceHistory;
import com.andikisha.tenant.domain.model.Plan;
import com.andikisha.tenant.domain.model.TenantLicence;
import com.andikisha.tenant.domain.repository.LicenceHistoryRepository;
import com.andikisha.tenant.domain.repository.PlanRepository;
import com.andikisha.tenant.domain.repository.TenantLicenceRepository;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * End-to-end integration test for the licence application service backed
 * by H2 in PostgreSQL-compatibility mode. RabbitMQ and Redis are mocked
 * because the tests verify DB-state, not infrastructure round-trips.
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
@Sql("/db/test-data/seed_plans.sql")
class LicencePlanServiceIT {

    @MockitoBean private ConnectionFactory connectionFactory;
    @MockitoBean private RabbitTemplate rabbitTemplate;
    @MockitoBean private RedisConnectionFactory redisConnectionFactory;
    @MockitoBean private StringRedisTemplate stringRedisTemplate;

    @Autowired private LicencePlanService licencePlanService;
    @Autowired private TenantLicenceRepository licenceRepository;
    @Autowired private LicenceHistoryRepository historyRepository;
    @Autowired private PlanRepository planRepository;

    @Test
    void createInitialLicence_withTrialDays_createsTrialLicenceAndHistoryRow() {
        Plan plan = planRepository.findByNameAndTenantId("Starter", "SYSTEM").orElseThrow();
        String tenantId = UUID.randomUUID().toString();

        TenantLicence licence = licencePlanService.createInitialLicence(
                tenantId, plan.getId(), BillingCycle.MONTHLY, 5,
                BigDecimal.valueOf(2500), 14, "system");

        assertThat(licence.getStatus()).isEqualTo(LicenceStatus.TRIAL);
        assertThat(licence.getEndDate()).isEqualTo(LocalDate.now().plusDays(14));
        assertThat(licence.getLicenceKey()).isNotNull();

        List<LicenceHistory> history = historyRepository.findByLicenceIdOrderByChangedAtDesc(licence.getId());
        assertThat(history).hasSize(1);
        assertThat(history.get(0).getNewStatus()).isEqualTo(LicenceStatus.TRIAL);
        assertThat(history.get(0).getChangeReason()).isEqualTo("Initial licence creation");
    }

    @Test
    void createInitialLicence_withZeroTrialDays_createsActiveLicenceFor12Months() {
        Plan plan = planRepository.findByNameAndTenantId("Professional", "SYSTEM").orElseThrow();
        String tenantId = UUID.randomUUID().toString();

        TenantLicence licence = licencePlanService.createInitialLicence(
                tenantId, plan.getId(), BillingCycle.ANNUAL, 25,
                BigDecimal.valueOf(120000), 0, "sales");

        assertThat(licence.getStatus()).isEqualTo(LicenceStatus.ACTIVE);
        assertThat(licence.getEndDate()).isEqualTo(LocalDate.now().plusMonths(12));
    }

    @Test
    void renew_supersedesOldLicenceAndCreatesNewActive() {
        Plan plan = planRepository.findByNameAndTenantId("Starter", "SYSTEM").orElseThrow();
        String tenantId = UUID.randomUUID().toString();

        TenantLicence original = licencePlanService.createInitialLicence(
                tenantId, plan.getId(), BillingCycle.MONTHLY, 5,
                BigDecimal.valueOf(2500), 0, "system");

        TenantLicence renewed = licencePlanService.renew(
                tenantId, plan.getId(), BillingCycle.ANNUAL, 10,
                BigDecimal.valueOf(30000),
                LocalDate.now().plusYears(1),
                "admin");

        assertThat(renewed.getId()).isNotEqualTo(original.getId());
        assertThat(renewed.getStatus()).isEqualTo(LicenceStatus.ACTIVE);
        assertThat(renewed.getBillingCycle()).isEqualTo(BillingCycle.ANNUAL);
        assertThat(licenceRepository.findById(renewed.getId())).isPresent();

        List<LicenceHistory> oldHistory = historyRepository
                .findByLicenceIdOrderByChangedAtDesc(original.getId());
        assertThat(oldHistory).anyMatch(h -> "Renewal — superseded".equals(h.getChangeReason()));

        List<LicenceHistory> newHistory = historyRepository
                .findByLicenceIdOrderByChangedAtDesc(renewed.getId());
        assertThat(newHistory).anyMatch(h -> "Licence renewed".equals(h.getChangeReason()));
    }
}
