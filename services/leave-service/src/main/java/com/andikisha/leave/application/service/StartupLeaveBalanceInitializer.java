package com.andikisha.leave.application.service;

import com.andikisha.leave.domain.model.LeavePolicy;
import com.andikisha.leave.domain.repository.LeaveBalanceRepository;
import com.andikisha.leave.domain.repository.LeavePolicyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Heals leave balances for employees whose records were created outside the normal
 * EmployeeCreatedEvent flow (e.g., Flyway seed data or direct DB inserts).
 *
 * Runs once on application startup. Skips tenants with no active leave policies.
 * Skips employees who already have balances for the current year.
 * Disable in production once all data pipelines are event-driven:
 *   app.leave.startup-heal.enabled=false
 */
@Component
public class StartupLeaveBalanceInitializer {

    private static final Logger log = LoggerFactory.getLogger(StartupLeaveBalanceInitializer.class);

    private final LeavePolicyRepository policyRepository;
    private final LeaveBalanceRepository balanceRepository;
    private final LeaveBalanceService balanceService;
    private final String employeeServiceUrl;
    private final boolean healEnabled;

    public StartupLeaveBalanceInitializer(
            LeavePolicyRepository policyRepository,
            LeaveBalanceRepository balanceRepository,
            LeaveBalanceService balanceService,
            @Value("${app.employee-service.url:http://localhost:8082}") String employeeServiceUrl,
            @Value("${app.leave.startup-heal.enabled:true}") boolean healEnabled) {
        this.policyRepository = policyRepository;
        this.balanceRepository = balanceRepository;
        this.balanceService = balanceService;
        this.employeeServiceUrl = employeeServiceUrl;
        this.healEnabled = healEnabled;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void healMissingLeaveBalances() {
        if (!healEnabled) {
            return;
        }

        int currentYear = LocalDate.now().getYear();
        List<String> tenants = policyRepository.findDistinctActiveTenantIds();
        if (tenants.isEmpty()) {
            return;
        }

        RestTemplate restTemplate = new RestTemplate();
        int totalInitialized = 0;

        for (String tenantId : tenants) {
            try {
                totalInitialized += healTenant(tenantId, currentYear, restTemplate);
            } catch (Exception e) {
                // Non-fatal: employee-service may not be reachable yet in some startup orders
                log.warn("Leave balance heal skipped for tenant {}: {}", tenantId, e.getMessage());
            }
        }

        if (totalInitialized > 0) {
            log.info("Leave balance startup heal: initialized {} employee records across {} tenant(s)",
                    totalInitialized, tenants.size());
        }
    }

    @SuppressWarnings("unchecked")
    private int healTenant(String tenantId, int year, RestTemplate restTemplate) {
        // Fetch active employees for this tenant from employee-service via internal trusted headers.
        // This is an HTTP call rather than gRPC because leave-service has no employee gRPC client.
        // Acceptable here: startup-only, not a hot path. Add a gRPC client when the employee
        // proto is wired into leave-service.
        HttpHeaders headers = new HttpHeaders();
        headers.set("X-User-ID", "system");
        headers.set("X-User-Role", "ADMIN");
        headers.set("X-Tenant-ID", tenantId);
        HttpEntity<Void> request = new HttpEntity<>(headers);

        String url = employeeServiceUrl + "/api/v1/employees?size=1000&status=ACTIVE";
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                url, HttpMethod.GET, request,
                new ParameterizedTypeReference<>() {});

        if (response.getBody() == null) return 0;

        List<Map<String, Object>> employees =
                (List<Map<String, Object>>) response.getBody().get("content");
        if (employees == null || employees.isEmpty()) return 0;

        // Fetch active policies once per tenant, not once per employee
        List<LeavePolicy> policies = policyRepository.findByTenantIdAndActiveTrue(tenantId);
        if (policies.isEmpty()) return 0;

        // Employees already initialized for this year (avoid N+1 on the balance side)
        Set<UUID> alreadyInitialized = balanceRepository
                .findByTenantIdAndYear(tenantId, year).stream()
                .map(b -> b.getEmployeeId())
                .collect(Collectors.toSet());

        int count = 0;
        for (Map<String, Object> emp : employees) {
            UUID employeeId = UUID.fromString((String) emp.get("id"));
            if (!alreadyInitialized.contains(employeeId)) {
                balanceService.initializeForNewEmployee(tenantId, employeeId);
                count++;
            }
        }
        return count;
    }
}
