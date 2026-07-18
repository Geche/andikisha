package com.andikisha.recruitment.application.dto.response;

import java.time.LocalDate;
import java.util.UUID;

public record RequisitionResponse(
        UUID id,
        String title,
        UUID departmentId,
        UUID positionId,
        String employmentType,
        MoneyResponse salaryMin,
        MoneyResponse salaryMax,
        int headcount,
        String status,
        UUID raisedByEmployeeId,
        LocalDate targetStartDate,
        String description
) {}
