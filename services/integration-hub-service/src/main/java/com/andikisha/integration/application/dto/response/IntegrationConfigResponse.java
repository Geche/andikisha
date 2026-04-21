package com.andikisha.integration.application.dto.response;

public record IntegrationConfigResponse(
        String integrationType,
        String shortcode,
        String environment,
        boolean active,
        boolean configured
) {}