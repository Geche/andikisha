package com.andikisha.attendance.application.dto.request;

import com.andikisha.attendance.domain.model.AttendanceSource;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record ClockInRequest(
        @NotNull(message = "Clock-in time is required")
        LocalDateTime clockInTime,

        AttendanceSource source,
        Double latitude,
        Double longitude,
        String notes
) {}
