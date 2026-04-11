package com.andikisha.leave.application.dto.response;

import java.math.BigDecimal;
import java.util.UUID;

public record LeaveBalanceResponse(
        UUID employeeId,
        String leaveType,
        int year,
        BigDecimal accrued,
        BigDecimal used,
        BigDecimal carriedOver,
        BigDecimal available,
        boolean frozen
) {}
