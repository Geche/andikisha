package com.andikisha.gateway.controller;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import javax.crypto.SecretKey;
import java.time.Duration;
import java.util.Base64;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * SUPER_ADMIN-only platform health aggregation.
 * Served locally by the gateway (not routed to tenant-service).
 * Parallel health checks with 2-second timeout per service.
 */
@RestController
@RequestMapping("/api/v1/super-admin/system")
public class SuperAdminSystemController {

    private static final Duration HEALTH_TIMEOUT = Duration.ofSeconds(2);

    private final WebClient webClient;
    private final Map<String, String> services;
    private final SecretKey jwtKey;

    public SuperAdminSystemController(
            WebClient.Builder webClientBuilder,
            @Value("${app.jwt.secret}") String jwtSecret,
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
        byte[] keyBytes = Base64.getUrlDecoder().decode(jwtSecret);
        this.jwtKey = Keys.hmacShaKeyFor(keyBytes);
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
    public Mono<ResponseEntity<Map<String, Object>>> systemHealth(ServerWebExchange exchange) {
        if (!isSuperAdmin(exchange)) {
            return Mono.just(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
        }

        // api-gateway is always UP — it is serving this request.
        Map<String, String> selfEntry = Map.of("name", "api-gateway", "status", "UP");

        return Flux.fromIterable(services.entrySet())
                .flatMap(entry -> checkService(entry.getKey(), entry.getValue()))
                .collectList()
                .map(serviceList -> {
                    var all = new java.util.ArrayList<Map<String, String>>();
                    all.add(selfEntry);
                    all.addAll(serviceList);
                    return ResponseEntity.ok(Map.<String, Object>of("services", all));
                });
    }

    private Mono<Map<String, String>> checkService(String name, String baseUrl) {
        return webClient.get()
                .uri(baseUrl + "/actuator/health")
                .retrieve()
                .bodyToMono(String.class)
                .map(body -> Map.of("name", name, "status", "UP"))
                .timeout(HEALTH_TIMEOUT)
                .onErrorReturn(Map.of("name", name, "status", "UNKNOWN"));
    }

    private boolean isSuperAdmin(ServerWebExchange exchange) {
        String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return false;
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(jwtKey)
                    .build()
                    .parseSignedClaims(authHeader.substring(7))
                    .getPayload();
            return "SUPER_ADMIN".equals(claims.get("role", String.class));
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
