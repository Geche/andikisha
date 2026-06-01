package com.andikisha.employee.application.bulk;

public record BulkRowError(int row, String field, String value, String message) {}
