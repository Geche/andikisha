package com.andikisha.leave.application.dto.response;

import java.util.UUID;

public record LeavePolicyResponse(
        UUID id,
        String leaveType,
        int daysPerYear,
        int carryOverMax,
        boolean requiresApproval,
        boolean requiresMedicalCert,
        int minDaysNotice,
        Integer maxConsecutiveDays
) {}