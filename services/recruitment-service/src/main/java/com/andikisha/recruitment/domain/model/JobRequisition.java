package com.andikisha.recruitment.domain.model;

import com.andikisha.common.domain.BaseEntity;
import com.andikisha.common.domain.Money;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.AttributeOverrides;
import jakarta.persistence.Column;
import jakarta.persistence.Embedded;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.Getter;

import java.time.LocalDate;
import java.util.UUID;

/**
 * A request to hire for a role. {@code departmentId} / {@code positionId} are bare cross-service
 * UUID references (no FK). Salary bands use two embedded {@link Money} value objects; both are
 * optional.
 */
@Getter
@Entity
@Table(name = "job_requisition")
public class JobRequisition extends BaseEntity {

    @Column(nullable = false, length = 150)
    private String title;

    @Column(name = "department_id")
    private UUID departmentId;

    @Column(name = "position_id")
    private UUID positionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", nullable = false, length = 20)
    private EmploymentType employmentType;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "amount",   column = @Column(name = "salary_min_amount")),
            @AttributeOverride(name = "currency", column = @Column(name = "salary_min_currency", length = 3))
    })
    private Money salaryMin;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "amount",   column = @Column(name = "salary_max_amount")),
            @AttributeOverride(name = "currency", column = @Column(name = "salary_max_currency", length = 3))
    })
    private Money salaryMax;

    @Column(nullable = false)
    private int headcount = 1;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private RequisitionStatus status;

    @Column(name = "raised_by_employee_id")
    private UUID raisedByEmployeeId;

    @Column(name = "target_start_date")
    private LocalDate targetStartDate;

    @Column(columnDefinition = "text")
    private String description;

    protected JobRequisition() {}

    public static JobRequisition create(String tenantId, String title, UUID departmentId,
                                        UUID positionId, EmploymentType employmentType,
                                        Money salaryMin, Money salaryMax, Integer headcount,
                                        UUID raisedByEmployeeId, LocalDate targetStartDate,
                                        String description) {
        JobRequisition r = new JobRequisition();
        r.setTenantId(tenantId);
        r.title = title;
        r.departmentId = departmentId;
        r.positionId = positionId;
        r.employmentType = employmentType;
        r.salaryMin = salaryMin;
        r.salaryMax = salaryMax;
        r.headcount = headcount != null ? headcount : 1;
        r.status = RequisitionStatus.DRAFT;
        r.raisedByEmployeeId = raisedByEmployeeId;
        r.targetStartDate = targetStartDate;
        r.description = description;
        return r;
    }

    public void update(String title, UUID departmentId, UUID positionId,
                       EmploymentType employmentType, Money salaryMin, Money salaryMax,
                       Integer headcount, LocalDate targetStartDate, String description,
                       RequisitionStatus status) {
        if (title != null && !title.isBlank()) this.title = title;
        this.departmentId = departmentId;
        this.positionId = positionId;
        if (employmentType != null) this.employmentType = employmentType;
        this.salaryMin = salaryMin;
        this.salaryMax = salaryMax;
        if (headcount != null) this.headcount = headcount;
        this.targetStartDate = targetStartDate;
        this.description = description;
        if (status != null) this.status = status;
    }
}
