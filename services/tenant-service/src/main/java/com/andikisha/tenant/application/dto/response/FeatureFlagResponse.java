package com.andikisha.tenant.application.dto.response;

public record FeatureFlagResponse(
        String featureKey,
        boolean enabled,
        String description
) {}