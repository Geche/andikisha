package com.andikisha.gateway.controller;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.util.Map;

@RestController
@RequestMapping("/fallback")
public class FallbackController {

    private static final RequestMethod[] ALL_METHODS = {
            RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT,
            RequestMethod.PATCH, RequestMethod.DELETE
    };

    @RequestMapping(value = "/default", method = {RequestMethod.GET, RequestMethod.POST,
            RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public Mono<Map<String, String>> defaultFallback() {
        return serviceUnavailable("downstream-service");
    }

    @RequestMapping(value = "/auth", method = {RequestMethod.GET, RequestMethod.POST,
            RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public Mono<Map<String, String>> authFallback() {
        return serviceUnavailable("auth-service");
    }

    @RequestMapping(value = "/employee", method = {RequestMethod.GET, RequestMethod.POST,
            RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public Mono<Map<String, String>> employeeFallback() {
        return serviceUnavailable("employee-service");
    }

    @RequestMapping(value = "/tenant", method = {RequestMethod.GET, RequestMethod.POST,
            RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public Mono<Map<String, String>> tenantFallback() {
        return serviceUnavailable("tenant-service");
    }

    @RequestMapping(value = "/payroll", method = {RequestMethod.GET, RequestMethod.POST,
            RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public Mono<Map<String, String>> payrollFallback() {
        return serviceUnavailable("payroll-service");
    }

    @RequestMapping(value = "/compliance", method = {RequestMethod.GET, RequestMethod.POST,
            RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public Mono<Map<String, String>> complianceFallback() {
        return serviceUnavailable("compliance-service");
    }

    @RequestMapping(value = "/attendance", method = {RequestMethod.GET, RequestMethod.POST,
            RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public Mono<Map<String, String>> attendanceFallback() {
        return serviceUnavailable("attendance-service");
    }

    @RequestMapping(value = "/leave", method = {RequestMethod.GET, RequestMethod.POST,
            RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public Mono<Map<String, String>> leaveFallback() {
        return serviceUnavailable("leave-service");
    }

    @RequestMapping(value = "/document", method = {RequestMethod.GET, RequestMethod.POST,
            RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public Mono<Map<String, String>> documentFallback() {
        return serviceUnavailable("document-service");
    }

    @RequestMapping(value = "/notification", method = {RequestMethod.GET, RequestMethod.POST,
            RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public Mono<Map<String, String>> notificationFallback() {
        return serviceUnavailable("notification-service");
    }

    @RequestMapping(value = "/integration", method = {RequestMethod.GET, RequestMethod.POST,
            RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public Mono<Map<String, String>> integrationFallback() {
        return serviceUnavailable("integration-hub-service");
    }

    @RequestMapping(value = "/analytics", method = {RequestMethod.GET, RequestMethod.POST,
            RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public Mono<Map<String, String>> analyticsFallback() {
        return serviceUnavailable("analytics-service");
    }

    @RequestMapping(value = "/audit", method = {RequestMethod.GET, RequestMethod.POST,
            RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    @ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
    public Mono<Map<String, String>> auditFallback() {
        return serviceUnavailable("audit-service");
    }

    private Mono<Map<String, String>> serviceUnavailable(String service) {
        return Mono.just(Map.of(
                "error", "SERVICE_UNAVAILABLE",
                "message", service + " is temporarily unavailable. Please try again later.",
                "service", service,
                "status", String.valueOf(HttpStatus.SERVICE_UNAVAILABLE.value())
        ));
    }
}
