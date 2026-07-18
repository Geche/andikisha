package com.andikisha.recruitment.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

/**
 * A published (or draft) advertisement for a requisition. {@code pipelineTemplateId} is chosen at
 * creation and is immutable — editing a template affects FUTURE postings only, never an existing
 * posting's applicants.
 */
@Getter
@Entity
@Table(name = "job_posting")
public class JobPosting extends BaseEntity {

    @Column(name = "requisition_id", nullable = false)
    private UUID requisitionId;

    @Column(name = "pipeline_template_id", nullable = false, updatable = false)
    private UUID pipelineTemplateId;

    @Column(nullable = false, length = 150)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Column(length = 150)
    private String location;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PostingStatus status;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "closing_date")
    private LocalDate closingDate;

    protected JobPosting() {}

    public static JobPosting create(String tenantId, UUID requisitionId, UUID pipelineTemplateId,
                                    String title, String description, String location,
                                    LocalDate closingDate) {
        JobPosting p = new JobPosting();
        p.setTenantId(tenantId);
        p.requisitionId = requisitionId;
        p.pipelineTemplateId = pipelineTemplateId;
        p.title = title;
        p.description = description;
        p.location = location;
        p.status = PostingStatus.DRAFT;
        p.closingDate = closingDate;
        return p;
    }

    public void publish() {
        this.status = PostingStatus.PUBLISHED;
        this.publishedAt = Instant.now();
    }

    public void update(String title, String description, String location, LocalDate closingDate) {
        if (title != null && !title.isBlank()) this.title = title;
        this.description = description;
        this.location = location;
        this.closingDate = closingDate;
    }
}
