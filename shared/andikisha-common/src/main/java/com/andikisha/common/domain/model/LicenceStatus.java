package com.andikisha.common.domain.model;

public enum LicenceStatus {
    TRIAL,
    ACTIVE,
    GRACE_PERIOD,   // Payment failed or expired — full access, 14-day window
    SUSPENDED,      // 14 days past grace — read-only access, no writes
    EXPIRED,        // 30 days past suspended — full lockout
    CANCELLED       // Explicitly cancelled by SUPER_ADMIN
}
