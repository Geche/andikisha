package com.andikisha.recruitment.application.dto.response;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

public record PostingResponse(
        UUID id,
        UUID requisitionId,
        UUID pipelineTemplateId,
        String title,
        String description,
        String location,
        String status,
        Instant publishedAt,
        LocalDate closingDate
) {}
