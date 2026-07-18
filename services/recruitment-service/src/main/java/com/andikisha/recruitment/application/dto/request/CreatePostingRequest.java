package com.andikisha.recruitment.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.UUID;

public record CreatePostingRequest(
        @NotNull UUID requisitionId,
        @NotNull UUID pipelineTemplateId,
        @NotBlank String title,
        String description,
        String location,
        LocalDate closingDate
) {}
