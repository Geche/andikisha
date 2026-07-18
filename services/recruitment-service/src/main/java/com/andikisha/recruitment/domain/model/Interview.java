package com.andikisha.recruitment.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

/**
 * A scheduled interview for an applicant. {@code interviewerEmployeeId} is the assigned
 * interviewer (a LINE_MANAGER) — feedback ownership is checked against it (Form B).
 */
@Getter
@Entity
@Table(name = "interview")
public class Interview extends BaseEntity {

    @Column(name = "applicant_id", nullable = false)
    private UUID applicantId;

    @Column(name = "scheduled_at", nullable = false)
    private Instant scheduledAt;

    @Column(name = "interviewer_employee_id", nullable = false)
    private UUID interviewerEmployeeId;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private InterviewMode mode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private InterviewStatus status;

    @Column(length = 200)
    private String location;

    protected Interview() {}

    public static Interview create(String tenantId, UUID applicantId, Instant scheduledAt,
                                   UUID interviewerEmployeeId, InterviewMode mode, String location) {
        Interview i = new Interview();
        i.setTenantId(tenantId);
        i.applicantId = applicantId;
        i.scheduledAt = scheduledAt;
        i.interviewerEmployeeId = interviewerEmployeeId;
        i.mode = mode;
        i.status = InterviewStatus.SCHEDULED;
        i.location = location;
        return i;
    }

    public void markCompleted() {
        this.status = InterviewStatus.COMPLETED;
    }

    public void cancel() {
        this.status = InterviewStatus.CANCELLED;
    }
}
