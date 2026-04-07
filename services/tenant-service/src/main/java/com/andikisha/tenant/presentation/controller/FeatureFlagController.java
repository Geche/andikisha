package com.andikisha.tenant.presentation.controller;

import com.andikisha.tenant.application.dto.response.FeatureFlagResponse;
import com.andikisha.tenant.application.service.FeatureFlagService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/feature-flags")
@Tag(name = "Feature Flags", description = "Tenant feature toggles")
@Validated
public class FeatureFlagController {

    private final FeatureFlagService featureFlagService;

    public FeatureFlagController(FeatureFlagService featureFlagService) {
        this.featureFlagService = featureFlagService;
    }

    @GetMapping
    @Operation(summary = "List all feature flags for current tenant")
    public List<FeatureFlagResponse> list() {
        return featureFlagService.getAllForTenant();
    }

    @PutMapping("/{featureKey}/enable")
    @Operation(summary = "Enable a feature flag (idempotent)")
    public FeatureFlagResponse enable(
            @PathVariable @Size(max = 100) @Pattern(regexp = "[a-zA-Z0-9_.-]+",
                    message = "featureKey may only contain letters, digits, underscores, dots, and hyphens")
            String featureKey) {
        return featureFlagService.enable(featureKey);
    }

    @PutMapping("/{featureKey}/disable")
    @Operation(summary = "Disable a feature flag (idempotent)")
    public FeatureFlagResponse disable(
            @PathVariable @Size(max = 100) @Pattern(regexp = "[a-zA-Z0-9_.-]+",
                    message = "featureKey may only contain letters, digits, underscores, dots, and hyphens")
            String featureKey) {
        return featureFlagService.disable(featureKey);
    }
}