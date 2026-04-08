package com.andikisha.employee.application.dto.response;

import java.util.UUID;

public record DepartmentResponse(
        UUID id,
        String name,
        String description,
        UUID parentId,
        long employeeCount,
        boolean active
) {}