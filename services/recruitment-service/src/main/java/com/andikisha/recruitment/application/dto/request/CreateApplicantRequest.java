package com.andikisha.recruitment.application.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreateApplicantRequest(
        @NotNull UUID jobPostingId,
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank @Email String email,
        String phoneNumber,
        String nationalId,
        String kraPin,
        String nhifNumber,
        String nssfNumber,
        String source
) {}
