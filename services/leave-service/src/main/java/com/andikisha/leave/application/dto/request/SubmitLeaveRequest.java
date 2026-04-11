package com.andikisha.leave.application.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;

public record SubmitLeaveRequest(
        @NotBlank(message = "Leave type is required")
        String leaveType,

        @NotNull(message = "Start date is required")
        LocalDate startDate,

        @NotNull(message = "End date is required")
        LocalDate endDate,

        @NotNull(message = "Number of days is required")
        @DecimalMin(value = "0.1", message = "Days must be positive")
        BigDecimal days,

        String reason
) {}
