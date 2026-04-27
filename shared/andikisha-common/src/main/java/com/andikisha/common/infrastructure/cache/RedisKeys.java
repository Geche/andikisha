package com.andikisha.common.infrastructure.cache;

public final class RedisKeys {

    private RedisKeys() {}

    // Tenant licence status cache. TTL: 60 seconds.
    // Written by Tenant Service on every licence status transition.
    // Read by gateway and LicenceValidationAspect before every write operation.
    public static String licenceStatus(String tenantId) {
        return "licence:status:" + tenantId;
    }

    // Payroll disbursement concurrent-run lock. TTL: 30 minutes.
    // Written by gateway on disbursement initiation. Cleared on completion.
    public static String payrollDisbursementLock(String tenantId) {
        return "lock:payroll:disburse:" + tenantId;
    }

    // USSD session cache. TTL: 5 minutes.
    // Written by Auth Service on USSD session creation.
    public static String ussdSession(String msisdn) {
        return "ussd:session:" + msisdn;
    }
}
