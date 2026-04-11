package com.andikisha.leave.application.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ReviewLeaveRequest(
        @NotBlank(message = "Rejection reason is required")
        String rejectionReason
) {}
