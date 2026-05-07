package com.andikisha.analytics.application.dto.response;

import java.time.LocalDate;

public record HeadcountSnapshotResponse(
        LocalDate snapshotDate,
        int totalActive,
        int totalOnProbation,
        int totalOnLeave,
        int totalSuspended,
        int totalTerminated,
        int newHires,
        int exits,
        int permanentCount,
        int contractCount,
        int casualCount,
        int internCount,
        int totalHeadcount
) {}
