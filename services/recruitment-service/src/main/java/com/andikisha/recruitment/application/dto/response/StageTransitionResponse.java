package com.andikisha.recruitment.application.dto.response;

import java.time.Instant;
import java.util.UUID;

public record StageTransitionResponse(
        UUID id,
        UUID applicantId,
        UUID fromStageId,
        UUID toStageId,
        String movedByUserId,
        String note,
        Instant movedAt
) {}
