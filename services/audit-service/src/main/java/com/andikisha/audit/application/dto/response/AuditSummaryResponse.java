package com.andikisha.audit.application.dto.response;

import java.util.List;

public record AuditSummaryResponse(
        long totalEntries,
        List<DomainActionCount> breakdown
) {
    public record DomainActionCount(
            String domain,
            String action,
            long count
    ) {}
}