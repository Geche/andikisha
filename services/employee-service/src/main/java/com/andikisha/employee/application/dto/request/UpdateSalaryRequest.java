package com.andikisha.employee.application.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public record UpdateSalaryRequest(
        @NotNull @Positive BigDecimal basicSalary,
        BigDecimal housingAllowance,
        BigDecimal transportAllowance,
        BigDecimal medicalAllowance,
        BigDecimal otherAllowances
) {}
