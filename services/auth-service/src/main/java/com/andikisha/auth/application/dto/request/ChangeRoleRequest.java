package com.andikisha.auth.application.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ChangeRoleRequest(
        @NotBlank(message = "role is required")
        String role) {}
