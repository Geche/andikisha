package com.andikisha.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.List;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        String error,
        String message,
        LocalDateTime timestamp,
        String traceId,
        List<FieldError> fieldErrors
) {
    public ErrorResponse(String error, String message) {
        this(error, message, LocalDateTime.now(), null, null);
    }

    public ErrorResponse(String error, String message, String traceId) {
        this(error, message, LocalDateTime.now(), traceId, null);
    }

    public ErrorResponse(String error, List<FieldError> fieldErrors) {
        this(error, "Validation failed", LocalDateTime.now(), null, fieldErrors);
    }

    public record FieldError(String field, String message) {}
}