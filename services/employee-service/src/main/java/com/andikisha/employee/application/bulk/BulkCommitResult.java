package com.andikisha.employee.application.bulk;

import java.util.List;
import java.util.UUID;

public record BulkCommitResult(int createdCount, List<UUID> employeeIds) {}
