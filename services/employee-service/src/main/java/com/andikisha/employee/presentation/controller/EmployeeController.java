package com.andikisha.employee.presentation.controller;

import com.andikisha.employee.application.dto.request.CreateEmployeeRequest;
import com.andikisha.employee.application.dto.request.TerminateEmployeeRequest;
import com.andikisha.employee.application.dto.request.UpdateEmployeeRequest;
import com.andikisha.employee.application.dto.request.UpdateProfileRequest;
import com.andikisha.employee.application.dto.request.UpdateSalaryRequest;
import com.andikisha.employee.application.dto.response.EmployeeDetailResponse;
import com.andikisha.employee.application.dto.response.EmployeeSummaryResponse;
import com.andikisha.employee.application.service.EmployeeQueryService;
import com.andikisha.employee.application.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employees")
@Tag(name = "Employees", description = "Employee management")
public class EmployeeController {

    private static final Set<String> ALLOWED_AVATAR_TYPES =
            Set.of("image/jpeg", "image/png", "image/webp");
    private static final long MAX_AVATAR_BYTES = 2 * 1024 * 1024; // 2 MB

    private final EmployeeService employeeService;
    private final EmployeeQueryService queryService;

    @Value("${app.avatar.storage-path:${user.home}/andikisha-avatars}")
    private String avatarStoragePath;

    @Value("${app.avatar.base-url:http://localhost:8082}")
    private String avatarBaseUrl;

    public EmployeeController(EmployeeService employeeService,
                              EmployeeQueryService queryService) {
        this.employeeService = employeeService;
        this.queryService = queryService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    @Operation(summary = "Create a new employee")
    public EmployeeDetailResponse create(
            @RequestHeader("X-User-ID") String userId,
            @Valid @RequestBody CreateEmployeeRequest request) {
        return employeeService.create(request, userId);
    }

    @GetMapping("/me")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'ADMIN', 'HR_MANAGER', 'HR_OFFICER')")
    @Operation(summary = "Get the calling employee's own record (self-service)")
    public EmployeeDetailResponse getMe(@RequestHeader("X-User-Email") String email) {
        return queryService.findByEmail(email);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER', 'PAYROLL_OFFICER', 'LINE_MANAGER', 'EMPLOYEE')")
    @Operation(summary = "List employees — scoped by role: ALL (HR_OFFICER/HR_MANAGER/Admin), DEPARTMENT (LINE_MANAGER), OWN (EMPLOYEE)")
    public Page<EmployeeSummaryResponse> list(
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-Employee-ID", required = false) String employeeId,
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return queryService.findAll(role, employeeId, departmentId, status, search, pageable);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR_OFFICER') or #id.toString().equals(authentication.name)")
    @Operation(summary = "Get employee by ID")
    public EmployeeDetailResponse getById(@PathVariable UUID id) {
        return queryService.findById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'HR_OFFICER', 'ADMIN')")
    @Operation(summary = "Update employee details")
    public EmployeeDetailResponse update(
            @RequestHeader("X-User-ID") String userId,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateEmployeeRequest request) {
        return employeeService.update(id, request, userId);
    }

    @PutMapping("/{id}/salary")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    @Operation(summary = "Update employee salary")
    public EmployeeDetailResponse updateSalary(
            @RequestHeader("X-User-ID") String userId,
            @PathVariable UUID id,
            @Valid @RequestBody UpdateSalaryRequest request) {
        return employeeService.updateSalary(id, request, userId);
    }

    @PostMapping("/{id}/confirm-probation")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    @Operation(summary = "Confirm probation and activate employee")
    public EmployeeDetailResponse confirmProbation(
            @RequestHeader("X-User-ID") String userId,
            @PathVariable UUID id) {
        return employeeService.confirmProbation(id, userId);
    }

    @PostMapping("/{id}/terminate")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    @Operation(summary = "Terminate an employee")
    public void terminate(
            @RequestHeader("X-User-ID") String userId,
            @PathVariable UUID id,
            @Valid @RequestBody TerminateEmployeeRequest request) {
        employeeService.terminate(id, request.reason(), userId);
    }

    // ─── Tier-1 self-service ──────────────────────────────────────────────────

    @PatchMapping("/me/profile")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Update caller's own tier-1 profile fields (phone, personalEmail, emergency contact)")
    public EmployeeDetailResponse updateMyProfile(
            @RequestHeader("X-Employee-ID") UUID employeeId,
            @Valid @RequestBody UpdateProfileRequest request) {
        return employeeService.selfUpdateProfile(employeeId, request);
    }

    @PostMapping(value = "/me/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Upload caller's avatar (JPEG/PNG/WEBP, max 2 MB)")
    public EmployeeDetailResponse uploadAvatar(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-Employee-ID") UUID employeeId,
            @RequestParam("file") MultipartFile file) throws IOException {

        if (!ALLOWED_AVATAR_TYPES.contains(file.getContentType())) {
            throw new com.andikisha.common.exception.BusinessRuleException("INVALID_FILE_TYPE",
                    "Avatar must be JPEG, PNG, or WEBP.");
        }
        if (file.getSize() > MAX_AVATAR_BYTES) {
            throw new com.andikisha.common.exception.BusinessRuleException("FILE_TOO_LARGE",
                    "Avatar must be 2 MB or smaller.");
        }

        String ext = switch (file.getContentType()) {
            case "image/jpeg" -> ".jpg";
            case "image/png"  -> ".png";
            default           -> ".webp";
        };
        Path dir = Paths.get(avatarStoragePath, tenantId);
        Files.createDirectories(dir);
        Path dest = dir.resolve(employeeId + ext);
        file.transferTo(dest);

        String avatarUrl = avatarBaseUrl + "/api/v1/employees/" + employeeId + "/avatar";
        return employeeService.updateAvatarUrl(employeeId, avatarUrl);
    }

    @GetMapping("/{id}/avatar")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Serve employee avatar image")
    public org.springframework.http.ResponseEntity<org.springframework.core.io.Resource> serveAvatar(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable UUID id) throws IOException {
        for (String ext : new String[]{".jpg", ".png", ".webp"}) {
            Path p = Paths.get(avatarStoragePath, tenantId, id + ext);
            if (Files.exists(p)) {
                var resource = new org.springframework.core.io.PathResource(p);
                String ct = ext.equals(".webp") ? "image/webp"
                          : ext.equals(".png")  ? "image/png" : "image/jpeg";
                return org.springframework.http.ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(ct))
                        .body(resource);
            }
        }
        return org.springframework.http.ResponseEntity.notFound().build();
    }
}
