package com.andikisha.recruitment.integration;

import com.andikisha.recruitment.domain.model.Applicant;
import com.andikisha.recruitment.domain.model.JobPosting;
import com.andikisha.recruitment.domain.model.PipelineStage;
import com.andikisha.recruitment.domain.model.PipelineTemplate;
import com.andikisha.recruitment.domain.model.StageCategory;
import com.andikisha.recruitment.domain.model.StageTransition;
import com.andikisha.recruitment.domain.repository.ApplicantRepository;
import com.andikisha.recruitment.domain.repository.JobPostingRepository;
import com.andikisha.recruitment.domain.repository.PipelineTemplateRepository;
import com.andikisha.recruitment.domain.repository.StageTransitionRepository;
import com.andikisha.recruitment.infrastructure.config.JpaConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Postgres-backed repository/aggregate tests. Skipped automatically when Docker is unavailable
 * ({@code disabledWithoutDocker = true}) — they always compile. Flyway is disabled; the schema is
 * derived from the entity mappings (create-drop) so the mappings themselves are exercised.
 */
@DataJpaTest
@Import(JpaConfig.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers(disabledWithoutDocker = true)
class RecruitmentRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("test_recruitment")
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

    @Autowired TestEntityManager em;
    @Autowired PipelineTemplateRepository templateRepository;
    @Autowired ApplicantRepository applicantRepository;
    @Autowired JobPostingRepository postingRepository;
    @Autowired StageTransitionRepository transitionRepository;

    private static final String TENANT_A = "tenant-alpha";
    private static final String TENANT_B = "tenant-beta";

    @Test
    void pipelineTemplate_cascadesStagesAndLoadsThemInOrder() {
        PipelineTemplate template = PipelineTemplate.create(TENANT_A, "Default hiring pipeline");
        template.addStage(PipelineStage.create(TENANT_A, 0, "Applied", StageCategory.APPLIED));
        template.addStage(PipelineStage.create(TENANT_A, 1, "Screening", StageCategory.INTERMEDIATE));
        template.addStage(PipelineStage.create(TENANT_A, 2, "Hired", StageCategory.HIRED));
        template.addStage(PipelineStage.create(TENANT_A, 3, "Rejected", StageCategory.REJECTED));
        UUID id = templateRepository.save(template).getId();
        em.flush();
        em.clear();

        PipelineTemplate loaded = templateRepository.findByIdAndTenantId(id, TENANT_A).orElseThrow();
        assertThat(loaded.getStages()).extracting(PipelineStage::getName)
                .containsExactly("Applied", "Screening", "Hired", "Rejected");
        assertThat(templateRepository.findByIdAndTenantId(id, TENANT_B)).isEmpty();
    }

    @Test
    void applicant_existsByCurrentStage_isTenantScoped() {
        UUID stageId = UUID.randomUUID();
        Applicant a = Applicant.create(TENANT_A, UUID.randomUUID(), "Amina", "Otieno",
                "amina@example.com", null, null, null, null, null, stageId, "referral");
        applicantRepository.save(a);
        em.flush();

        assertThat(applicantRepository.existsByTenantIdAndCurrentStageId(TENANT_A, stageId)).isTrue();
        assertThat(applicantRepository.existsByTenantIdAndCurrentStageId(TENANT_B, stageId)).isFalse();
        assertThat(applicantRepository.existsByTenantIdAndCurrentStageId(TENANT_A, UUID.randomUUID()))
                .isFalse();
    }

    @Test
    void jobPosting_existsByPipelineTemplate_isTenantScoped() {
        UUID templateId = UUID.randomUUID();
        JobPosting posting = JobPosting.create(TENANT_A, UUID.randomUUID(), templateId,
                "Backend Engineer", null, null, null);
        postingRepository.save(posting);
        em.flush();

        assertThat(postingRepository.existsByTenantIdAndPipelineTemplateId(TENANT_A, templateId)).isTrue();
        assertThat(postingRepository.existsByTenantIdAndPipelineTemplateId(TENANT_B, templateId)).isFalse();
    }

    @Test
    void stageTransition_appendsAndLoadsChronologically() {
        UUID applicantId = UUID.randomUUID();
        UUID applied = UUID.randomUUID();
        UUID screening = UUID.randomUUID();
        transitionRepository.save(
                StageTransition.create(TENANT_A, applicantId, null, applied, "user-1", null));
        transitionRepository.save(
                StageTransition.create(TENANT_A, applicantId, applied, screening, "user-1", "advance"));
        em.flush();

        var history = transitionRepository
                .findByTenantIdAndApplicantIdOrderByMovedAtAsc(TENANT_A, applicantId);
        assertThat(history).hasSize(2);
        assertThat(history.get(0).getFromStageId()).isNull();
        assertThat(history.get(1).getFromStageId()).isEqualTo(applied);
    }
}
