package com.andikisha.events.tenant;

import com.andikisha.events.BaseEvent;

import java.time.LocalDate;

public class LicenceExpiringEvent extends BaseEvent {

    private String licenceId;
    private String expiryDate;
    private int daysUntilExpiry;
    private String planName;

    public LicenceExpiringEvent(String tenantId, String licenceId,
                                LocalDate expiryDate, int daysUntilExpiry, String planName) {
        super("licence.expiring", tenantId);
        this.licenceId = licenceId;
        this.expiryDate = expiryDate.toString();
        this.daysUntilExpiry = daysUntilExpiry;
        this.planName = planName;
    }

    protected LicenceExpiringEvent() { super(); }

    public String getLicenceId() { return licenceId; }
    public String getExpiryDate() { return expiryDate; }
    public int getDaysUntilExpiry() { return daysUntilExpiry; }
    public String getPlanName() { return planName; }
}
