package com.andikisha.attendance.application.dto.request;

import com.andikisha.attendance.domain.model.AttendanceSource;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;

public record ClockOutRequest(
        @NotNull(message = "Clock-out time is required")
        LocalDateTime clockOutTime,

        AttendanceSource source,
        Double latitude,
        Double longitude
) {}
