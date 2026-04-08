package com.andikisha.employee.presentation.advice;

import com.andikisha.common.dto.ErrorResponse;
import com.andikisha.employee.domain.exception.DepartmentNotFoundException;
import com.andikisha.employee.domain.exception.EmployeeNotFoundException;
import com.andikisha.employee.domain.exception.PositionNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Employee-service-specific exception handler.
 * Generic cases (validation, duplicates, business rules) are handled by
 * {@code GlobalExceptionHandler} from andikisha-common, which is registered
 * via {@code scanBasePackages} on {@code EmployeeServiceApplication}.
 */
@RestControllerAdvice
public class EmployeeExceptionHandler {

    @ExceptionHandler({
            EmployeeNotFoundException.class,
            DepartmentNotFoundException.class,
            PositionNotFoundException.class
    })
    public ResponseEntity<ErrorResponse> handleNotFound(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(new ErrorResponse("NOT_FOUND", ex.getMessage()));
    }
}
