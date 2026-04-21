package com.andikisha.integration.presentation.advice;

import com.andikisha.common.dto.ErrorResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class IntegrationExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(IntegrationExceptionHandler.class);

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleUnreadableBody(HttpMessageNotReadableException ex) {
        log.warn("Malformed request body: {}", ex.getMessage());
        return ResponseEntity.badRequest()
                .body(new ErrorResponse("MALFORMED_REQUEST",
                        "Request body is malformed or missing"));
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String detail = "Invalid value '" + ex.getValue()
                + "' for parameter '" + ex.getName() + "'";
        if (ex.getRequiredType() != null && ex.getRequiredType().isEnum()) {
            detail += ". Allowed values: "
                    + java.util.Arrays.toString(ex.getRequiredType().getEnumConstants());
        }
        log.warn("Type mismatch: {}", detail);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(new ErrorResponse("INVALID_PARAMETER", detail));
    }
}
