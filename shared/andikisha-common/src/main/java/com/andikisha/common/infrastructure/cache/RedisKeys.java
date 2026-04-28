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

    // Tenant plan tier cache. TTL: 24 hours.
    // Written by Tenant Service on licence creation and plan upgrade.
    // Read by Auth Service at JWT issuance to include the plan claim.
    public static String tenantPlanTier(String tenantId) {
        return "tenant:plan:" + tenantId;
    }

    // USSD session cache. TTL: 5 minutes.
    // Written by Auth Service on USSD session creation.
    public static String ussdSession(String msisdn) {
        return "ussd:session:" + msisdn;
    }
}
