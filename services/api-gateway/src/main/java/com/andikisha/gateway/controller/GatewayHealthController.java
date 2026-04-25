package com.andikisha.gateway.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.util.LinkedHashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/gateway")
public class GatewayHealthController {

    private final WebClient webClient;
    private final Map<String, String> services;

    public GatewayHealthController(
            WebClient.Builder webClientBuilder,
            @Value("${AUTH_SERVICE_URL:http://localhost:8081}") String authUrl,
            @Value("${EMPLOYEE_SERVICE_URL:http://localhost:8082}") String employeeUrl,
            @Value("${TENANT_SERVICE_URL:http://localhost:8083}") String tenantUrl,
            @Value("${PAYROLL_SERVICE_URL:http://localhost:8084}") String payrollUrl,
            @Value("${COMPLIANCE_SERVICE_URL:http://localhost:8085}") String complianceUrl,
            @Value("${ATTENDANCE_SERVICE_URL:http://localhost:8086}") String attendanceUrl,
            @Value("${LEAVE_SERVICE_URL:http://localhost:8087}") String leaveUrl,
            @Value("${DOCUMENT_SERVICE_URL:http://localhost:8088}") String documentUrl,
            @Value("${NOTIFICATION_SERVICE_URL:http://localhost:8089}") String notificationUrl,
            @Value("${INTEGRATION_SERVICE_URL:http://localhost:8090}") String integrationUrl,
            @Value("${ANALYTICS_SERVICE_URL:http://localhost:8091}") String analyticsUrl,
            @Value("${AUDIT_SERVICE_URL:http://localhost:8092}") String auditUrl) {
        this.webClient = webClientBuilder.build();
        this.services = new LinkedHashMap<>();
        services.put("auth-service", authUrl);
        services.put("employee-service", employeeUrl);
        services.put("tenant-service", tenantUrl);
        services.put("payroll-service", payrollUrl);
        services.put("compliance-service", complianceUrl);
        services.put("time-attendance-service", attendanceUrl);
        services.put("leave-service", leaveUrl);
        services.put("document-service", documentUrl);
        services.put("notification-service", notificationUrl);
        services.put("integration-hub-service", integrationUrl);
        services.put("analytics-service", analyticsUrl);
        services.put("audit-service", auditUrl);
    }

    @GetMapping("/health")
    public Mono<Map<String, Object>> aggregatedHealth() {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("gateway", "UP");

        return Mono.just(result)
                .flatMap(r -> {
                    var checks = services.entrySet().stream()
                            .map(entry -> checkService(entry.getKey(), entry.getValue())
                                    .doOnNext(status -> r.put(entry.getKey(), status)))
                            .toList();
                    return Mono.when(checks).thenReturn(r);
                });
    }

    private Mono<String> checkService(String name, String baseUrl) {
        return webClient.get()
                .uri(baseUrl + "/actuator/health")
                .retrieve()
                .bodyToMono(String.class)
                .map(body -> "UP")
                .timeout(Duration.ofSeconds(3))
                .onErrorReturn("DOWN");
    }
}
