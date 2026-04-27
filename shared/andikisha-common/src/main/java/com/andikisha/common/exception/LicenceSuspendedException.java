package com.andikisha.common.exception;

import com.andikisha.common.domain.model.LicenceStatus;

public class LicenceSuspendedException extends RuntimeException {

    private final String tenantId;
    private final LicenceStatus currentStatus;

    public LicenceSuspendedException(String tenantId, LicenceStatus currentStatus) {
        super("Tenant " + tenantId + " licence is " + currentStatus
                + ". Write operations are not permitted.");
        this.tenantId = tenantId;
        this.currentStatus = currentStatus;
    }

    public String getTenantId() { return tenantId; }
    public LicenceStatus getCurrentStatus() { return currentStatus; }
}
