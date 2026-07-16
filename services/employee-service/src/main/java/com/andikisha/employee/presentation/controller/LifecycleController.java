package com.andikisha.employee.presentation.controller;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.employee.application.dto.request.CompleteTaskRequest;
import com.andikisha.employee.application.dto.request.CreateLifecycleTemplateRequest;
import com.andikisha.employee.application.dto.request.UpdateLifecycleTemplateRequest;
import com.andikisha.employee.application.dto.response.LifecycleInstanceResponse;
import com.andikisha.employee.application.dto.response.LifecycleTaskResponse;
import com.andikisha.employee.application.dto.response.LifecycleTemplateResponse;
import com.andikisha.employee.application.service.LifecycleWorkflowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * Employee lifecycle (onboarding / offboarding) workflow API.
 * <p>Every path is under {@code /api/v1/employees/...} on purpose — the gateway only routes
 * that prefix and the BFF allowlist only permits it. Do NOT add a new top-level prefix such
 * as {@code /api/v1/lifecycle} or {@code /api/v1/tasks}; those 403 at the proxy and 404 at
 * the gateway.
 */
@RestController
@RequestMapping("/api/v1/employees")
@Tag(name = "Employee Lifecycle", description = "Onboarding and offboarding workflows")
public class LifecycleController {

    private final LifecycleWorkflowService lifecycleService;

    public LifecycleController(LifecycleWorkflowService lifecycleService) {
        this.lifecycleService = lifecycleService;
    }

    // ── Templates ────────────────────────────────────────────────────────────

    @GetMapping("/lifecycle/templates")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "List lifecycle templates (seeds tenant defaults on first access)")
    public List<LifecycleTemplateResponse> listTemplates() {
        return lifecycleService.listTemplates();
    }

    @PostMapping("/lifecycle/templates")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Create a lifecycle template")
    public LifecycleTemplateResponse createTemplate(
            @Valid @RequestBody CreateLifecycleTemplateRequest request) {
        return lifecycleService.createTemplate(request);
    }

    @PutMapping("/lifecycle/templates/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Update a lifecycle template and replace its task definitions")
    public LifecycleTemplateResponse updateTemplate(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateLifecycleTemplateRequest request) {
        return lifecycleService.updateTemplate(id, request);
    }

    @PatchMapping("/lifecycle/templates/{id}/deactivate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Deactivate a lifecycle template")
    public void deactivateTemplate(@PathVariable UUID id) {
        lifecycleService.deactivateTemplate(id);
    }

    // ── Initiation ─────────────────────────────────────────────────────────────

    @PostMapping("/{employeeId}/lifecycle/onboarding")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Initiate onboarding for an employee")
    public LifecycleInstanceResponse initiateOnboarding(
            @RequestHeader("X-User-ID") String userId,
            @PathVariable UUID employeeId) {
        return lifecycleService.initiateOnboarding(employeeId, userId);
    }

    @PostMapping("/{employeeId}/lifecycle/offboarding")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Initiate offboarding for an employee")
    public LifecycleInstanceResponse initiateOffboarding(
            @RequestHeader("X-User-ID") String userId,
            @PathVariable UUID employeeId) {
        return lifecycleService.initiateOffboarding(employeeId, userId);
    }

    // ── Instances (reads) ──────────────────────────────────────────────────────

    @GetMapping("/lifecycle/instances")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "List lifecycle instances, optionally filtered by type and status")
    public List<LifecycleInstanceResponse> listInstances(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status) {
        return lifecycleService.listInstances(type, status);
    }

    @GetMapping("/{employeeId}/lifecycle/instances")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "List an employee's lifecycle instances")
    public List<LifecycleInstanceResponse> listEmployeeInstances(@PathVariable UUID employeeId) {
        return lifecycleService.listInstancesForEmployee(employeeId);
    }

    @GetMapping("/lifecycle/instances/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "Get a lifecycle instance by ID")
    public LifecycleInstanceResponse getInstance(@PathVariable UUID id) {
        return lifecycleService.getInstance(id);
    }

    // ── Tasks (complete / skip) ────────────────────────────────────────────────

    @PostMapping("/lifecycle/tasks/{taskId}/complete")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Complete a lifecycle task (own EMPLOYEE task, or any as HR_MANAGER/ADMIN)")
    public LifecycleInstanceResponse completeTask(
            @RequestHeader("X-User-ID") String userId,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-Employee-ID", required = false) String employeeId,
            @PathVariable UUID taskId,
            @RequestBody(required = false) CompleteTaskRequest request) {
        UUID callerEmployeeId = parseEmployeeId(employeeId);
        UUID documentId = request != null ? request.documentId() : null;
        return lifecycleService.completeTask(taskId, role, callerEmployeeId, userId, documentId);
    }

    @PostMapping("/lifecycle/tasks/{taskId}/skip")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Skip a lifecycle task (own EMPLOYEE task, or any as HR_MANAGER/ADMIN)")
    public LifecycleInstanceResponse skipTask(
            @RequestHeader("X-User-ID") String userId,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-Employee-ID", required = false) String employeeId,
            @PathVariable UUID taskId) {
        UUID callerEmployeeId = parseEmployeeId(employeeId);
        return lifecycleService.skipTask(taskId, role, callerEmployeeId, userId);
    }

    // ── Employee self-service ────────────────────────────────────────────────────

    @GetMapping("/me/lifecycle/onboarding-tasks")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "The caller's own open onboarding tasks (resolved via X-Employee-ID)")
    public List<LifecycleTaskResponse> myOnboardingTasks(
            @RequestHeader(value = "X-Employee-ID", required = false) String employeeId) {
        UUID callerEmployeeId = parseEmployeeId(employeeId);
        if (callerEmployeeId == null) {
            return List.of();
        }
        return lifecycleService.myOnboardingTasks(callerEmployeeId);
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
