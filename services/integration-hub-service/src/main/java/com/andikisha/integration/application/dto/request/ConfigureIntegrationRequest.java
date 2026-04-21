package com.andikisha.integration.application.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ConfigureIntegrationRequest(
        @NotBlank(message = "Integration type is required")
        String integrationType,

        String apiKey,
        String apiSecret,
        String shortcode,
        String initiatorName,
        String securityCredential,
        String callbackUrl,
        String timeoutUrl,
        String environment
) {}