package com.andikisha.integration.presentation.controller;

import com.andikisha.integration.application.dto.response.PaymentSummaryResponse;
import com.andikisha.integration.application.dto.response.PaymentTransactionResponse;
import com.andikisha.integration.application.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/payments")
@Tag(name = "Payments", description = "Salary disbursement via M-Pesa and bank transfer")
@PreAuthorize("hasAnyRole('ADMIN', 'HR_MANAGER')")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/payroll-runs/{payrollRunId}/disburse")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Operation(summary = "Trigger salary disbursement for an approved payroll run")
    public void disburse(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable UUID payrollRunId) {
        paymentService.processBatchPayments(tenantId, payrollRunId);
    }

    @PostMapping("/payroll-runs/{payrollRunId}/retry-failed")
    @ResponseStatus(HttpStatus.ACCEPTED)
    @Operation(summary = "Retry failed payments for a payroll run")
    public void retryFailed(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable UUID payrollRunId) {
        paymentService.retryFailed(tenantId, payrollRunId);
    }

    @GetMapping("/payroll-runs/{payrollRunId}")
    @Operation(summary = "Get payment status for a payroll run")
    public List<PaymentTransactionResponse> forPayrollRun(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable UUID payrollRunId) {
        return paymentService.getForPayrollRun(payrollRunId);
    }

    @GetMapping("/payroll-runs/{payrollRunId}/summary")
    @Operation(summary = "Get payment summary for a payroll run")
    public PaymentSummaryResponse summary(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable UUID payrollRunId) {
        return paymentService.getPayrollPaymentSummary(payrollRunId);
    }

    @GetMapping
    @Operation(summary = "List all payment transactions")
    public Page<PaymentTransactionResponse> list(
            @RequestHeader("X-Tenant-ID") String tenantId,
            Pageable pageable) {
        return paymentService.listTransactions(pageable);
    }
}
