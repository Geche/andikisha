package com.andikisha.recruitment.application.dto.response;

import java.time.Instant;
import java.util.UUID;

public record InterviewResponse(
        UUID id,
        UUID applicantId,
        Instant scheduledAt,
        UUID interviewerEmployeeId,
        String mode,
        String status,
        String location
) {}
