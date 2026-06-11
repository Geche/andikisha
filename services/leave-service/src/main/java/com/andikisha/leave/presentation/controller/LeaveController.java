package com.andikisha.leave.presentation.controller;

import com.andikisha.leave.application.dto.request.ReviewLeaveRequest;
import com.andikisha.leave.application.dto.request.SubmitLeaveRequest;
import com.andikisha.leave.application.dto.response.LeaveBalanceResponse;
import com.andikisha.leave.application.dto.response.LeavePolicyResponse;
import com.andikisha.leave.application.dto.response.LeaveRequestResponse;
import com.andikisha.leave.application.service.LeaveBalanceService;
import com.andikisha.leave.application.service.LeavePolicyService;
import com.andikisha.leave.application.service.LeaveService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/leave")
@Tag(name = "Leave Management", description = "Leave requests, approvals, and balances")
public class LeaveController {

    private final LeaveService leaveService;
    private final LeaveBalanceService balanceService;
    private final LeavePolicyService policyService;

    public LeaveController(LeaveService leaveService,
                           LeaveBalanceService balanceService,
                           LeavePolicyService policyService) {
        this.leaveService = leaveService;
        this.balanceService = balanceService;
        this.policyService = policyService;
    }

    @PostMapping("/requests")
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Submit a leave request")
    public LeaveRequestResponse submit(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-User-ID") String userId,
            @RequestHeader(value = "X-Employee-ID", required = false) String employeeId,
            @RequestHeader(value = "X-User-Name", required = false) String userName,
            @Valid @RequestBody SubmitLeaveRequest request) {
        UUID empId = employeeId != null ? UUID.fromString(employeeId) : UUID.fromString(userId);
        String name = userName != null ? userName : "Employee";
        return leaveService.submit(empId, name, request);
    }

    @PostMapping("/requests/{id}/approve")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN', 'LINE_MANAGER')")
    @Operation(summary = "Approve a leave request")
    public LeaveRequestResponse approve(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-User-ID") String userId,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @PathVariable UUID id) {
        // Gateway injects X-User-Email (not X-User-Name); capture it as the human-
        // readable reviewer identifier. Auth has no name field yet — email is the name.
        return leaveService.approve(id, UUID.fromString(userId),
                userEmail != null && !userEmail.isBlank() ? userEmail : "System");
    }

    @PostMapping("/requests/{id}/reject")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN', 'LINE_MANAGER')")
    @Operation(summary = "Reject a leave request")
    public LeaveRequestResponse reject(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-User-ID") String userId,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail,
            @PathVariable UUID id,
            @Valid @RequestBody ReviewLeaveRequest request) {
        return leaveService.reject(id, UUID.fromString(userId),
                userEmail != null && !userEmail.isBlank() ? userEmail : "System",
                request.rejectionReason());
    }

    @PostMapping("/requests/{id}/cancel")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Cancel a pending leave request (employee only)")
    public void cancel(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-User-ID") String userId,
            @PathVariable UUID id) {
        leaveService.cancel(id, UUID.fromString(userId));
    }

    @PostMapping("/requests/{id}/reverse")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'ADMIN')")
    @Operation(summary = "HR reversal of an approved leave request — restores balance")
    public LeaveRequestResponse reverse(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader("X-User-ID") String userId,
            @RequestHeader(value = "X-User-Name", required = false) String userName,
            @PathVariable UUID id,
            @Valid @RequestBody ReviewLeaveRequest request) {
        return leaveService.hrReverse(id, UUID.fromString(userId),
                userName != null ? userName : "HR",
                request.rejectionReason());
    }

    @GetMapping("/requests")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'HR_OFFICER', 'ADMIN', 'LINE_MANAGER', 'EMPLOYEE')")
    @Operation(summary = "List leave requests — scoped by role: ALL (HR_OFFICER/HR_MANAGER/ADMIN), DEPARTMENT (LINE_MANAGER), OWN (EMPLOYEE)")
    public Page<LeaveRequestResponse> listRequests(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader(value = "X-User-Role", required = false) String role,
            @RequestHeader(value = "X-Employee-ID", required = false) String employeeId,
            @RequestParam(required = false) String status,
            Pageable pageable) {
        return leaveService.listRequests(role, employeeId, status, pageable);
    }

    @GetMapping("/requests/{id}")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'HR_OFFICER', 'ADMIN', 'LINE_MANAGER')")
    @Operation(summary = "Get a leave request by ID")
    public LeaveRequestResponse getRequest(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable UUID id) {
        return leaveService.getRequest(id);
    }

    @GetMapping("/employees/{employeeId}/requests")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'HR_OFFICER', 'ADMIN', 'LINE_MANAGER', 'EMPLOYEE')")
    @Operation(summary = "Get leave requests for a specific employee")
    public Page<LeaveRequestResponse> employeeRequests(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable UUID employeeId,
            Pageable pageable) {
        return leaveService.listEmployeeRequests(employeeId, pageable);
    }

    @GetMapping("/employees/{employeeId}/balances")
    @PreAuthorize("hasAnyRole('HR_MANAGER', 'HR_OFFICER', 'ADMIN', 'LINE_MANAGER') or #employeeId.toString().equals(authentication.name)")
    @Operation(summary = "Get leave balances for an employee")
    public List<LeaveBalanceResponse> balances(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable UUID employeeId,
            @RequestParam(required = false) Integer year) {
        int y = year != null ? year : LocalDate.now().getYear();
        return balanceService.getBalances(employeeId, y);
    }

    @GetMapping("/me/balances")
    @PreAuthorize("hasAnyRole('EMPLOYEE', 'LINE_MANAGER', 'HR_MANAGER', 'HR_OFFICER', 'ADMIN')")
    @Operation(summary = "Get leave balances for the currently authenticated employee")
    public List<LeaveBalanceResponse> myBalances(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @RequestHeader(value = "X-Employee-ID", required = false) UUID employeeId,
            @RequestParam(required = false) Integer year) {
        if (employeeId == null) {
            return List.of();
        }
        int y = year != null ? year : LocalDate.now().getYear();
        return balanceService.getBalances(employeeId, y);
    }

    @GetMapping("/policies")
    @Operation(summary = "Get leave policies for the tenant")
    public List<LeavePolicyResponse> policies(
            @RequestHeader("X-Tenant-ID") String tenantId) {
        return policyService.getPolicies();
    }
}