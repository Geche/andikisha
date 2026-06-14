package com.andikisha.auth.application.dto.request;

import jakarta.validation.constraints.NotNull;

/**
 * R3-2b: activate (true) or deactivate (false) a tenant user. Boxed Boolean + @NotNull so
 * a missing field is rejected rather than silently defaulting to deactivation.
 */
public record SetActiveRequest(
        @NotNull(message = "active is required")
        Boolean active) {}
