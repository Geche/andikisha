package com.andikisha.recruitment.presentation.controller;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.recruitment.application.dto.request.CreateRequisitionRequest;
import com.andikisha.recruitment.application.dto.request.UpdateRequisitionRequest;
import com.andikisha.recruitment.application.dto.response.RequisitionResponse;
import com.andikisha.recruitment.application.service.RequisitionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recruitment")
@Tag(name = "Requisitions", description = "Job requisitions (hire requests)")
public class RequisitionController {

    private final RequisitionService requisitionService;

    public RequisitionController(RequisitionService requisitionService) {
        this.requisitionService = requisitionService;
    }

    @GetMapping("/requisitions")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "List requisitions")
    public List<RequisitionResponse> list(@RequestHeader("X-Tenant-ID") String tenantId) {
        return requisitionService.listRequisitions();
    }

    @GetMapping("/requisitions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "Get a requisition by ID")
    public RequisitionResponse get(@RequestHeader("X-Tenant-ID") String tenantId,
                                   @PathVariable UUID id) {
        return requisitionService.getRequisition(id);
    }

    @PostMapping("/requisitions")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Create a requisition")
    public RequisitionResponse create(@RequestHeader("X-Tenant-ID") String tenantId,
                                      @Valid @RequestBody CreateRequisitionRequest request) {
        return requisitionService.createRequisition(request, null);
    }

    @PutMapping("/requisitions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Update a requisition")
    public RequisitionResponse update(@RequestHeader("X-Tenant-ID") String tenantId,
                                      @PathVariable UUID id,
                                      @Valid @RequestBody UpdateRequisitionRequest request) {
        return requisitionService.updateRequisition(id, request);
    }

    @PostMapping("/me/requisitions")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('LINE_MANAGER', 'ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "Raise a requisition as the caller (LINE_MANAGER self-service); "
            + "raisedByEmployeeId is the caller's X-Employee-ID")
    public RequisitionResponse raise(@RequestHeader("X-Tenant-ID") String tenantId,
                                     @RequestHeader(value = "X-Employee-ID", required = false) String employeeId,
                                     @Valid @RequestBody CreateRequisitionRequest request) {
        UUID callerEmployeeId = parseEmployeeId(employeeId);
        if (callerEmployeeId == null) {
            throw new BusinessRuleException("NO_EMPLOYEE_CONTEXT",
                    "X-Employee-ID is required to raise a requisition via /me");
        }
        return requisitionService.createRequisition(request, callerEmployeeId);
    }

    private static UUID parseEmployeeId(String employeeId) {
        if (employeeId == null || employeeId.isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(employeeId);
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("INVALID_EMPLOYEE_CONTEXT",
                    "X-Employee-ID header is not a valid UUID");
        }
    }
}
