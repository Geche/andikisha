package com.andikisha.recruitment.presentation.controller;

import com.andikisha.recruitment.application.dto.request.CreateApplicantRequest;
import com.andikisha.recruitment.application.dto.request.MoveApplicantRequest;
import com.andikisha.recruitment.application.dto.response.ApplicantResponse;
import com.andikisha.recruitment.application.service.ApplicantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/recruitment")
@Tag(name = "Applicants", description = "Candidates and their pipeline movement")
public class ApplicantController {

    private final ApplicantService applicantService;

    public ApplicantController(ApplicantService applicantService) {
        this.applicantService = applicantService;
    }

    @GetMapping("/postings/{postingId}/applicants")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "List applicants for a posting (board groups by currentStageId client-side)")
    public List<ApplicantResponse> listByPosting(@RequestHeader("X-Tenant-ID") String tenantId,
                                                 @PathVariable UUID postingId) {
        return applicantService.listByPosting(postingId);
    }

    @PostMapping("/applicants")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Register an applicant against a posting (placed at the APPLIED stage)")
    public ApplicantResponse create(@RequestHeader("X-Tenant-ID") String tenantId,
                                    @RequestHeader("X-User-ID") String userId,
                                    @Valid @RequestBody CreateApplicantRequest request) {
        return applicantService.create(request, userId);
    }

    @PostMapping("/applicants/{id}/move")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Move an applicant to another stage of the same pipeline")
    public ApplicantResponse move(@RequestHeader("X-Tenant-ID") String tenantId,
                                  @RequestHeader("X-User-ID") String userId,
                                  @PathVariable UUID id,
                                  @Valid @RequestBody MoveApplicantRequest request) {
        return applicantService.moveStage(id, request.toStageId(), userId, request.note());
    }
}
