package com.andikisha.auth.presentation.advice;

import com.andikisha.auth.domain.exception.AccountLockedException;
import com.andikisha.auth.domain.exception.InvalidCredentialsException;
import com.andikisha.auth.domain.exception.TokenExpiredException;
import com.andikisha.auth.domain.exception.UserAlreadyActivatedException;
import com.andikisha.common.dto.ErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class AuthExceptionHandler {

    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleInvalidCredentials(InvalidCredentialsException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("INVALID_CREDENTIALS", ex.getMessage()));
    }

    @ExceptionHandler(TokenExpiredException.class)
    public ResponseEntity<ErrorResponse> handleTokenExpired(TokenExpiredException ex) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(new ErrorResponse("TOKEN_EXPIRED", ex.getMessage()));
    }

    @ExceptionHandler(AccountLockedException.class)
    public ResponseEntity<ErrorResponse> handleAccountLocked(AccountLockedException ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body(new ErrorResponse("ACCOUNT_LOCKED", ex.getMessage()));
    }

    /**
     * Includes the employeeId in the response body so the frontend can build a
     * direct link to the password-reset action on the employee's profile page.
     */
    @ExceptionHandler(UserAlreadyActivatedException.class)
    public ResponseEntity<Map<String, Object>> handleAlreadyActivated(UserAlreadyActivatedException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "USER_ALREADY_ACTIVATED");
        body.put("message", ex.getMessage());
        body.put("employeeId", ex.getEmployeeId().toString());
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(body);
    }
}
