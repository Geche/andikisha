package com.andikisha.integration.presentation.controller;

import com.andikisha.integration.application.dto.request.ConfigureIntegrationRequest;
import com.andikisha.integration.application.dto.response.IntegrationConfigResponse;
import com.andikisha.integration.application.service.IntegrationConfigService;
import com.andikisha.integration.domain.model.IntegrationType;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/integrations")
@Tag(name = "Integration Config", description = "Configure external service connections")
public class IntegrationConfigController {

    private final IntegrationConfigService configService;

    public IntegrationConfigController(IntegrationConfigService configService) {
        this.configService = configService;
    }

    @PostMapping("/configure")
    @Operation(summary = "Configure an integration (M-Pesa, KRA, etc.)")
    public IntegrationConfigResponse configure(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @Valid @RequestBody ConfigureIntegrationRequest request) {
        return configService.configure(request);
    }

    @PostMapping("/{type}/activate")
    @Operation(summary = "Activate a configured integration")
    public void activate(
            @RequestHeader("X-Tenant-ID") String tenantId,
            @PathVariable IntegrationType type) {
        configService.activate(type);
    }

    @GetMapping
    @Operation(summary = "List all integration configurations")
    public List<IntegrationConfigResponse> list(
            @RequestHeader("X-Tenant-ID") String tenantId) {
        return configService.listConfigs();
    }
}
