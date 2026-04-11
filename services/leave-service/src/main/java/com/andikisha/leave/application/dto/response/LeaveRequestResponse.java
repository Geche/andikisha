package com.andikisha.leave.application.dto.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record LeaveRequestResponse(
        UUID id,
        UUID employeeId,
        String employeeName,
        String leaveType,
        LocalDate startDate,
        LocalDate endDate,
        BigDecimal days,
        String reason,
        String status,
        UUID reviewedBy,
        String reviewerName,
        LocalDateTime reviewedAt,
        String rejectionReason,
        boolean hasMedicalCert,
        LocalDateTime createdAt
) {}
