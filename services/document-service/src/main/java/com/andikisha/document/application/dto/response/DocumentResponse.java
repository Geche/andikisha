package com.andikisha.document.application.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record DocumentResponse(
        UUID id,
        UUID employeeId,
        String employeeName,
        String documentType,
        String title,
        String fileName,
        Long fileSize,
        String contentType,
        String status,
        String period,
        UUID payrollRunId,
        String generatedBy,
        LocalDateTime generatedAt,
        LocalDateTime createdAt
) {}