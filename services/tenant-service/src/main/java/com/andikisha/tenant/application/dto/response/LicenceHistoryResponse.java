package com.andikisha.tenant.application.dto.response;

import com.andikisha.common.domain.model.LicenceStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record LicenceHistoryResponse(
        UUID id,
        String tenantId,
        UUID licenceId,
        LicenceStatus previousStatus,
        LicenceStatus newStatus,
        String changedBy,
        String changeReason,
        LocalDateTime changedAt
) {}
