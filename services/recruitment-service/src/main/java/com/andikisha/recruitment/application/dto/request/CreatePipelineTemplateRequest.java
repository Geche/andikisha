package com.andikisha.recruitment.application.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record CreatePipelineTemplateRequest(
        @NotBlank String name,
        @NotEmpty @Valid List<StageInputRequest> stages
) {}
