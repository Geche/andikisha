package com.andikisha.events.compliance;

import com.andikisha.events.BaseEvent;

public class ComplianceRateChangedEvent extends BaseEvent {

    private final String country;
    private final String rateType;
    private final String effectiveDate;

    public ComplianceRateChangedEvent(String tenantId, String country,
                                      String rateType, String effectiveDate) {
        super("compliance.rate_changed", tenantId);
        this.country = country;
        this.rateType = rateType;
        this.effectiveDate = effectiveDate;
    }

    protected ComplianceRateChangedEvent() { super(); this.country = null; this.rateType = null; this.effectiveDate = null; }

    public String getCountry() { return country; }
    public String getRateType() { return rateType; }
    public String getEffectiveDate() { return effectiveDate; }
}