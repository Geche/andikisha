package com.andikisha.recruitment.presentation.controller;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.recruitment.application.dto.request.CreateInterviewRequest;
import com.andikisha.recruitment.application.dto.request.SubmitFeedbackRequest;
import com.andikisha.recruitment.application.dto.response.FeedbackResponse;
import com.andikisha.recruitment.application.dto.response.InterviewResponse;
import com.andikisha.recruitment.application.service.InterviewService;
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
@Tag(name = "Interviews", description = "Interview scheduling and feedback")
public class InterviewController {

    private final InterviewService interviewService;

    public InterviewController(InterviewService interviewService) {
        this.interviewService = interviewService;
    }

    @GetMapping("/interviews")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "List interviews")
    public List<InterviewResponse> list(@RequestHeader("X-Tenant-ID") String tenantId) {
        return interviewService.listInterviews();
    }

    @GetMapping("/interviews/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "Get an interview by ID")
    public InterviewResponse get(@RequestHeader("X-Tenant-ID") String tenantId,
                                 @PathVariable UUID id) {
        return interviewService.getInterview(id);
    }

    @PostMapping("/interviews")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Schedule an interview and assign an interviewer")
    public InterviewResponse create(@RequestHeader("X-Tenant-ID") String tenantId,
                                    @Valid @RequestBody CreateInterviewRequest request) {
        return interviewService.createInterview(request);
    }

    @GetMapping("/me/interviews")
    @PreAuthorize("hasAnyRole('LINE_MANAGER', 'ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "Interviews assigned to the caller (resolved via X-Employee-ID)")
    public List<InterviewResponse> myInterviews(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader(value = "X-Employee-ID", required = false) String employeeId) {
        return interviewService.listMyInterviews(parseEmployeeId(employeeId));
    }

    @PostMapping("/interviews/{id}/feedback")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('LINE_MANAGER', 'ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "Submit interview feedback (Form B: only the assigned interviewer)")
    public FeedbackResponse submitFeedback(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader(value = "X-Employee-ID", required = false) String employeeId,
            @PathVariable UUID id,
            @Valid @RequestBody SubmitFeedbackRequest request) {
        return interviewService.submitFeedback(id, parseEmployeeId(employeeId), request);
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
