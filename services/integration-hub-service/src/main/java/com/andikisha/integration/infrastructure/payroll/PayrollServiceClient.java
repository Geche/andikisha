package com.andikisha.integration.infrastructure.payroll;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

/**
 * Internal client for calling payroll-service REST endpoints.
 * Uses trusted header auth (X-User-ID, X-User-Role, X-Tenant-ID) — the same
 * mechanism the API gateway uses when forwarding authenticated requests.
 * Calls payroll-service directly (not through the API gateway) to avoid
 * circular JWT dependency during event-driven flows.
 */
@Component
public class PayrollServiceClient {

    private static final Logger log = LoggerFactory.getLogger(PayrollServiceClient.class);
    private static final String SYSTEM_USER_ID = "00000000-0000-0000-0000-000000000001";

    private final RestTemplate restTemplate;
    private final String payrollServiceUrl;

    public PayrollServiceClient(
            RestTemplate restTemplate,
            @Value("${app.payroll-service.url:http://localhost:8084}") String payrollServiceUrl) {
        this.restTemplate = restTemplate;
        this.payrollServiceUrl = payrollServiceUrl;
    }

    public List<PayslipDisbursementInfo> getPayslipsForRun(String tenantId, UUID payrollRunId) {
        String url = payrollServiceUrl + "/api/v1/payroll/runs/" + payrollRunId + "/payslips";

        HttpHeaders headers = new HttpHeaders();
        headers.set("X-Tenant-ID", tenantId);
        headers.set("X-User-ID", SYSTEM_USER_ID);
        headers.set("X-User-Role", "ADMIN");

        try {
            List<PayslipDisbursementInfo> payslips = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    new HttpEntity<>(headers),
                    new ParameterizedTypeReference<List<PayslipDisbursementInfo>>() {}
            ).getBody();
            return payslips != null ? payslips : Collections.emptyList();
        } catch (Exception e) {
            log.error("Failed to fetch payslips for run {} from payroll-service: {}",
                    payrollRunId, e.getMessage());
            throw new RuntimeException("Cannot fetch payslips from payroll-service: " + e.getMessage(), e);
        }
    }

    public record PayslipDisbursementInfo(
            String id,
            String employeeId,
            String employeeName,
            String employeeNumber,
            BigDecimal netPay,
            String currency,
            String paymentPhone
    ) {}
}
