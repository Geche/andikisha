package com.andikisha.auth.presentation.controller;

import com.andikisha.auth.application.dto.request.UssdSessionRequest;
import com.andikisha.auth.application.dto.response.UssdSessionResponse;
import com.andikisha.auth.application.service.UssdAuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth/ussd")
@Tag(name = "USSD Authentication", description = "USSD session authentication for mobile flows")
public class UssdAuthController {

    private final UssdAuthService ussdAuthService;

    public UssdAuthController(UssdAuthService ussdAuthService) {
        this.ussdAuthService = ussdAuthService;
    }

    @PostMapping("/session")
    @Operation(summary = "Validate USSD PIN and issue short-lived session token")
    public UssdSessionResponse validateSession(@Valid @RequestBody UssdSessionRequest request) {
        return ussdAuthService.validateAndIssueToken(request);
    }
}
