package com.andikisha.recruitment.application.dto.response;

import java.util.List;
import java.util.UUID;

public record PipelineTemplateResponse(
        UUID id,
        String name,
        boolean active,
        List<PipelineStageResponse> stages
) {}
