package com.andikisha.auth.application.dto.request;

import java.util.UUID;

public record ProvisionEmployeeRequest(UUID employeeId, String email, String phone) {}
