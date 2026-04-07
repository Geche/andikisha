package com.andikisha.tenant.domain.exception;

import com.andikisha.common.exception.ResourceNotFoundException;

import java.util.UUID;

public class TenantNotFoundException extends ResourceNotFoundException {
    public TenantNotFoundException(UUID id) {
        super("Tenant", id);
    }

    public TenantNotFoundException(String identifier) {
        super("Tenant", identifier);
    }
}