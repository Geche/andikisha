package com.andikisha.tenant.domain.exception;

import com.andikisha.common.domain.model.LicenceStatus;

public class InvalidLicenceTransitionException extends RuntimeException {

    private final LicenceStatus from;
    private final LicenceStatus to;

    public InvalidLicenceTransitionException(LicenceStatus from, LicenceStatus to) {
        super("Invalid licence transition from " + from + " to " + to);
        this.from = from;
        this.to = to;
    }

    public LicenceStatus getFrom() { return from; }
    public LicenceStatus getTo() { return to; }
}
