package com.andikisha.events.compliance;

import com.andikisha.events.BaseEvent;

public class ComplianceRateChangedEvent extends BaseEvent {

    private String country;
    private String rateType;
    private String effectiveDate;

    public ComplianceRateChangedEvent(String tenantId, String country,
                                      String rateType, String effectiveDate) {
        super("compliance.rate_changed", tenantId);
        this.country = country;
        this.rateType = rateType;
        this.effectiveDate = effectiveDate;
    }

    protected ComplianceRateChangedEvent() { super(); }

    public String getCountry() { return country; }
    public String getRateType() { return rateType; }
    public String getEffectiveDate() { return effectiveDate; }
}