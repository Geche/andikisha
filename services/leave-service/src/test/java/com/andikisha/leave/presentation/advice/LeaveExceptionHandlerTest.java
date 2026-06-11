package com.andikisha.leave.presentation.advice;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

/**
 * Pins the service-local advice: it shadows the shared GlobalExceptionHandler, so a
 * wrong HTTP method must be answered 405 here too, not fall to the catch-all as 500.
 */
class LeaveExceptionHandlerTest {

    private final LeaveExceptionHandler handler = new LeaveExceptionHandler();

    @Test
    void methodNotSupported_returns405_notMaskedAs500() {
        var ex = new HttpRequestMethodNotSupportedException("PATCH", List.of("POST"));

        ResponseEntity<Map<String, Object>> res = handler.handleMethodNotSupported(ex);

        assertEquals(HttpStatus.METHOD_NOT_ALLOWED, res.getStatusCode());
        assertEquals("METHOD_NOT_ALLOWED", res.getBody().get("error"));
    }

    @Test
    void unhandledException_stillReturns500() {
        ResponseEntity<Map<String, Object>> res = handler.handleUnexpected(new RuntimeException("boom"));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, res.getStatusCode());
    }
}
