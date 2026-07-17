package com.andikisha.recruitment.application.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record SubmitFeedbackRequest(
        @Min(1) @Max(5) Integer rating,
        String recommendation,
        String comments
) {}
