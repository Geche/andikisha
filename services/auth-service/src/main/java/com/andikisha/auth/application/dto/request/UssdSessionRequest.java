package com.andikisha.auth.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UssdSessionRequest(
        @NotBlank(message = "MSISDN is required")
        @Pattern(regexp = "^\\+?[0-9]{10,15}$", message = "Invalid MSISDN format")
        String msisdn,

        @NotBlank(message = "PIN is required")
        @Size(min = 4, max = 4, message = "PIN must be exactly 4 digits")
        @Pattern(regexp = "^[0-9]{4}$", message = "PIN must be 4 digits")
        String pin
) {}
