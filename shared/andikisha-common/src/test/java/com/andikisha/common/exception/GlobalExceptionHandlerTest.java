package com.andikisha.common.exception;

import com.andikisha.common.dto.ErrorResponse;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.HttpRequestMethodNotSupportedException;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void methodNotSupported_returns405_notMaskedAs500() {
        var ex = new HttpRequestMethodNotSupportedException("PATCH", List.of("POST"));

        ResponseEntity<ErrorResponse> res = handler.handleMethodNotSupported(ex);

        assertEquals(HttpStatus.METHOD_NOT_ALLOWED, res.getStatusCode());
        assertEquals("METHOD_NOT_ALLOWED", res.getBody().error());
        // 405 must advertise the supported methods in the Allow header.
        assertTrue(res.getHeaders().getAllow().contains(HttpMethod.POST));
    }

    @Test
    void unhandledException_stillReturns500() {
        ResponseEntity<ErrorResponse> res = handler.handleGeneral(new RuntimeException("boom"));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, res.getStatusCode());
        assertEquals("INTERNAL_ERROR", res.getBody().error());
    }
}
