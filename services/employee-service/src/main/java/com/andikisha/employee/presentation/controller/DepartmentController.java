package com.andikisha.employee.presentation.controller;

import com.andikisha.employee.application.dto.request.CreateDepartmentRequest;
import com.andikisha.employee.application.dto.request.UpdateDepartmentRequest;
import com.andikisha.employee.application.dto.response.DepartmentResponse;
import com.andikisha.employee.application.service.DepartmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/departments")
@Tag(name = "Departments", description = "Department management")
public class DepartmentController {

    private final DepartmentService departmentService;

    public DepartmentController(DepartmentService departmentService) {
        this.departmentService = departmentService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR', 'EMPLOYEE')")
    @Operation(summary = "List all departments")
    public List<DepartmentResponse> list() {
        return departmentService.findAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Create a department")
    public DepartmentResponse create(@Valid @RequestBody CreateDepartmentRequest request) {
        return departmentService.create(request.name(), request.description(), request.parentId());
    }

    @PostMapping("/seed-defaults")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Seed default departments (idempotent — creates missing, skips existing)")
    public List<DepartmentResponse> seedDefaults() {
        return departmentService.seedDefaults();
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @Operation(summary = "Update a department")
    public DepartmentResponse update(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateDepartmentRequest request) {
        return departmentService.update(id, request.name(), request.description());
    }
}
