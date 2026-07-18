package com.andikisha.recruitment.application.dto.response;

import java.time.Instant;
import java.util.UUID;

public record FeedbackResponse(
        UUID id,
        UUID interviewId,
        UUID submittedByEmployeeId,
        Integer rating,
        String recommendation,
        String comments,
        Instant submittedAt
) {}
