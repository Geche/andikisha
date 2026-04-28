package com.andikisha.tenant.presentation.advice;

import com.andikisha.common.dto.ErrorResponse;
import com.andikisha.common.exception.LicenceSuspendedException;
import com.andikisha.tenant.domain.exception.InvalidLicenceTransitionException;
import com.andikisha.tenant.domain.exception.TenantNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Handles tenant-service-specific exceptions.
 * Shared exceptions (BusinessRuleException, DuplicateResourceException, validation)
 * are handled by GlobalExceptionHandler in andikisha-common.
 */
@RestControllerAdvice
public class TenantExceptionHandler {

    @ExceptionHandler(TenantNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleNotFound(TenantNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse("ACCESS_DENIED", "Access denied"));
    }

    @ExceptionHandler(InvalidLicenceTransitionException.class)
    public ResponseEntity<ErrorResponse> handleInvalidTransition(InvalidLicenceTransitionException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("INVALID_LICENCE_TRANSITION", ex.getMessage()));
    }

    @ExceptionHandler(LicenceSuspendedException.class)
    public ResponseEntity<ErrorResponse> handleLicenceSuspended(LicenceSuspendedException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse("LICENCE_SUSPENDED", ex.getMessage()));
    }
}
