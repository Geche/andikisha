package com.andikisha.employee.application.dto.response;

import java.util.UUID;

public record PositionResponse(
        UUID id,
        String title,
        String description,
        String gradeLevel,
        boolean active
) {}