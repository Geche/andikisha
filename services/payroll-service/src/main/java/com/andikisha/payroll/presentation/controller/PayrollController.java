package com.andikisha.payroll.presentation.controller;

import com.andikisha.payroll.application.dto.request.RunPayrollRequest;
import com.andikisha.payroll.application.dto.response.PaySlipResponse;
import com.andikisha.payroll.application.dto.response.PayrollRunResponse;
import com.andikisha.payroll.application.service.PayrollService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payroll")
@Tag(name = "Payroll", description = "Payroll processing")
public class PayrollController {

    private final PayrollService payrollService;

    public PayrollController(PayrollService payrollService) {
        this.payrollService = payrollService;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @PostMapping("/runs")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Initiate a new payroll run")
    public PayrollRunResponse initiate(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-User-ID") String userId,
            @Valid @RequestBody RunPayrollRequest request) {
        return payrollService.initiatePayroll(request, userId);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @PostMapping("/runs/{id}/calculate")
    @Operation(summary = "Calculate payroll for all active employees")
    public PayrollRunResponse calculate(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable UUID id) {
        return payrollService.calculatePayroll(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @PostMapping("/runs/{id}/approve")
    @Operation(summary = "Approve a calculated payroll run")
    public PayrollRunResponse approve(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-User-ID") String userId,
            @PathVariable UUID id) {
        return payrollService.approvePayroll(id, userId);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR')")
    @GetMapping("/runs")
    @Operation(summary = "List payroll runs")
    public Page<PayrollRunResponse> listRuns(
            @RequestHeader("X-Tenant-ID") String tenantId,
            Pageable pageable) {
        return payrollService.listPayrollRuns(pageable);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR')")
    @GetMapping("/runs/{id}")
    @Operation(summary = "Get payroll run details")
    public PayrollRunResponse getRun(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable UUID id) {
        return payrollService.getPayrollRun(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR')")
    @GetMapping("/runs/{id}/payslips")
    @Operation(summary = "Get all payslips for a payroll run")
    public List<PaySlipResponse> getPaySlips(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable UUID id) {
        return payrollService.getPaySlipsForRun(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR', 'EMPLOYEE')")
    @GetMapping("/payslips/{id}")
    @Operation(summary = "Get a single payslip")
    public PaySlipResponse getPaySlip(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable UUID id) {
        return payrollService.getPaySlip(id);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER', 'HR', 'EMPLOYEE')")
    @GetMapping("/employees/{employeeId}/payslips")
    @Operation(summary = "Get payslip history for an employee")
    public Page<PaySlipResponse> getEmployeePaySlips(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable UUID employeeId,
            Pageable pageable) {
        return payrollService.getEmployeePaySlips(employeeId, pageable);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
    @DeleteMapping("/runs/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Cancel a payroll run")
    public void cancel(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable UUID id,
            @RequestBody(required = false) Map<String, String> body) {
        payrollService.cancelPayroll(id,
                body != null ? body.getOrDefault("reason", "Cancelled") : "Cancelled");
    }
}
