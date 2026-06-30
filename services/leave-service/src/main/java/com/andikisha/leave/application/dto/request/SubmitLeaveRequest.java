package com.andikisha.leave.application.dto.request;

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

        // Advisory only. The server recomputes the day count from startDate..endDate
        // (inclusive calendar days) and ignores this value — it must not be trusted as
        // it drives the balance deduction. Retained for backwards compatibility with
        // existing clients that still send it.
        BigDecimal days,

        String reason
) {}
