package com.andikisha.recruitment.application.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;
import java.util.UUID;

public record UpdateRequisitionRequest(
        @NotBlank String title,
        UUID departmentId,
        UUID positionId,
        @NotBlank String employmentType,
        @Valid MoneyInput salaryMin,
        @Valid MoneyInput salaryMax,
        @Min(1) Integer headcount,
        LocalDate targetStartDate,
        String description,
        String status
) {}
