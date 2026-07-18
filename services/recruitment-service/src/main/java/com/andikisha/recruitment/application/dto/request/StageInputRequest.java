package com.andikisha.recruitment.application.dto.request;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

/**
 * A stage in a template create/update payload. {@code id} is null for a new stage and set for an
 * existing one (used to diff in place so stage ids survive edits). {@code category} names a
 * {@link com.andikisha.recruitment.domain.model.StageCategory}.
 */
public record StageInputRequest(
        UUID id,
        @NotBlank String name,
        @NotBlank String category
) {}
