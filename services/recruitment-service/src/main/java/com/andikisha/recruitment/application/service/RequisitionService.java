package com.andikisha.recruitment.application.service;

import com.andikisha.common.domain.Money;
import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.recruitment.application.dto.request.CreateRequisitionRequest;
import com.andikisha.recruitment.application.dto.request.MoneyInput;
import com.andikisha.recruitment.application.dto.request.UpdateRequisitionRequest;
import com.andikisha.recruitment.application.dto.response.RequisitionResponse;
import com.andikisha.recruitment.application.mapper.RecruitmentMapper;
import com.andikisha.recruitment.domain.model.EmploymentType;
import com.andikisha.recruitment.domain.model.JobRequisition;
import com.andikisha.recruitment.domain.model.RequisitionStatus;
import com.andikisha.recruitment.domain.repository.JobRequisitionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class RequisitionService {

    private final JobRequisitionRepository requisitionRepository;
    private final RecruitmentMapper mapper;

    public RequisitionService(JobRequisitionRepository requisitionRepository,
                              RecruitmentMapper mapper) {
        this.requisitionRepository = requisitionRepository;
        this.mapper = mapper;
    }

    public List<RequisitionResponse> listRequisitions() {
        String tenantId = TenantContext.requireTenantId();
        return requisitionRepository.findByTenantIdOrderByCreatedAtDesc(tenantId).stream()
                .map(mapper::toResponse)
                .toList();
    }

    public RequisitionResponse getRequisition(UUID id) {
        String tenantId = TenantContext.requireTenantId();
        return requisitionRepository.findByIdAndTenantId(id, tenantId)
                .map(mapper::toResponse)
                .orElseThrow(() -> new BusinessRuleException("REQUISITION_NOT_FOUND",
                        "Requisition not found: " + id));
    }

    /**
     * Creates a requisition. {@code raisedByOverride} carries the LINE_MANAGER's X-Employee-ID for
     * the /me path and takes precedence over any value in the request body.
     */
    @Transactional
    public RequisitionResponse createRequisition(CreateRequisitionRequest request,
                                                 UUID raisedByOverride) {
        String tenantId = TenantContext.requireTenantId();
        UUID raisedBy = raisedByOverride != null ? raisedByOverride : request.raisedByEmployeeId();
        JobRequisition requisition = JobRequisition.create(
                tenantId, request.title(), request.departmentId(), request.positionId(),
                parseEmploymentType(request.employmentType()), toMoney(request.salaryMin()),
                toMoney(request.salaryMax()), request.headcount(), raisedBy,
                request.targetStartDate(), request.description());
        return mapper.toResponse(requisitionRepository.save(requisition));
    }

    @Transactional
    public RequisitionResponse updateRequisition(UUID id, UpdateRequisitionRequest request) {
        String tenantId = TenantContext.requireTenantId();
        JobRequisition requisition = requisitionRepository.findByIdAndTenantId(id, tenantId)
                .orElseThrow(() -> new BusinessRuleException("REQUISITION_NOT_FOUND",
                        "Requisition not found: " + id));
        requisition.update(
                request.title(), request.departmentId(), request.positionId(),
                parseEmploymentType(request.employmentType()), toMoney(request.salaryMin()),
                toMoney(request.salaryMax()), request.headcount(), request.targetStartDate(),
                request.description(),
                request.status() != null ? parseStatus(request.status()) : null);
        return mapper.toResponse(requisitionRepository.save(requisition));
    }

    private Money toMoney(MoneyInput input) {
        return input != null ? Money.of(input.amount(), input.currency()) : null;
    }

    private static EmploymentType parseEmploymentType(String value) {
        try {
            return EmploymentType.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new BusinessRuleException("INVALID_ENUM_VALUE",
                    "Invalid employment type '" + value + "'");
        }
    }

    private static RequisitionStatus parseStatus(String value) {
        try {
            return RequisitionStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new BusinessRuleException("INVALID_ENUM_VALUE",
                    "Invalid requisition status '" + value + "'");
        }
    }
}
