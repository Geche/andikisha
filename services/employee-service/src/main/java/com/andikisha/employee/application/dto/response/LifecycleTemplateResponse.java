package com.andikisha.employee.application.dto.response;

import java.util.List;
import java.util.UUID;

public record LifecycleTemplateResponse(
        UUID id,
        String type,
        String name,
        boolean active,
        List<String> applicableEmploymentTypes,
        List<LifecycleTaskDefinitionResponse> tasks
) {}
