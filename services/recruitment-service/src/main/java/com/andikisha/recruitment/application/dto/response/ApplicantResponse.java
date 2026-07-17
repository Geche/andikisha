package com.andikisha.recruitment.application.dto.response;

import java.time.Instant;
import java.util.UUID;

public record ApplicantResponse(
        UUID id,
        UUID jobPostingId,
        String firstName,
        String lastName,
        String email,
        String phoneNumber,
        String nationalId,
        String kraPin,
        String nhifNumber,
        String nssfNumber,
        UUID currentStageId,
        String source,
        Instant appliedAt
) {}
