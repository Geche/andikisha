package com.andikisha.employee.presentation.controller;

import com.andikisha.employee.application.dto.request.CreateEmployeeRequest;
import com.andikisha.employee.application.dto.request.TerminateEmployeeRequest;
import com.andikisha.employee.application.dto.request.UpdateEmployeeRequest;
import com.andikisha.employee.application.dto.request.UpdateSalaryRequest;
import com.andikisha.employee.application.dto.response.EmployeeDetailResponse;
import com.andikisha.employee.application.dto.response.EmployeeSummaryResponse;
import com.andikisha.employee.application.service.EmployeeQueryService;
import com.andikisha.employee.application.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/employees")
@Tag(name = "Employees", description = "Employee management")
public class EmployeeController {

    private final EmployeeService employeeService;
    private final EmployeeQueryService queryService;

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

    @GetMapping
    @Operation(summary = "List employees with filtering and pagination")
    public Page<EmployeeSummaryResponse> list(
            @RequestParam(required = false) String departmentId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return queryService.findAll(departmentId, status, search, pageable);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get employee by ID")
    public EmployeeDetailResponse getById(@PathVariable UUID id) {
        return queryService.findById(id);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
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
}
