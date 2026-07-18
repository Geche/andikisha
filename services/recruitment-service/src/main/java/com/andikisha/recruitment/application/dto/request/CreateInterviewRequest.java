package com.andikisha.recruitment.application.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.UUID;

public record CreateInterviewRequest(
        @NotNull UUID applicantId,
        @NotNull Instant scheduledAt,
        @NotNull UUID interviewerEmployeeId,
        String mode,
        String location
) {}
