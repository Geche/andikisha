package com.andikisha.tenant.application.dto.response;

public record WorkspaceResolveResponse(
        String tenantId,
        String organisationName,
        String status
) {}
