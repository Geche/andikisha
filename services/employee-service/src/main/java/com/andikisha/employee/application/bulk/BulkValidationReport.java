package com.andikisha.employee.application.bulk;

import java.util.List;
import java.util.UUID;

public record BulkValidationReport(
        int totalRows,
        int validRows,
        List<BulkRowError> errors,
        UUID uploadId           // null when there are errors and commit is blocked
) {}
