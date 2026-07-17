package com.andikisha.recruitment.application.dto.response;

import java.util.UUID;

public record PipelineStageResponse(
        UUID id,
        int orderIndex,
        String name,
        String category,
        boolean isProtected
) {}
