package com.andikisha.recruitment.application.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record MoveApplicantRequest(
        @NotNull UUID toStageId,
        String note
) {}
