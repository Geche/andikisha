package com.andikisha.tenant.application.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateWorkspaceRequest(
        @NotBlank(message = "Workspace must not be blank")
        @Size(max = 20, message = "Workspace must not exceed 20 characters")
        @Pattern(
                regexp = "^[a-z0-9]([a-z0-9-]*[a-z0-9])?$",
                message = "Workspace may only contain lowercase letters, numbers, and hyphens, " +
                          "and must start and end with a letter or number"
        )
        String workspace
) {}
