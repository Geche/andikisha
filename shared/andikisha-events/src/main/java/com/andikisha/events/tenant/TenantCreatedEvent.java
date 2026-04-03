package com.andikisha.events.tenant;

import com.andikisha.events.BaseEvent;

public class TenantCreatedEvent extends BaseEvent {

    private final String tenantName;
    private final String country;
    private final String currency;
    private final String plan;
    private final String adminEmail;

    public TenantCreatedEvent(String tenantId, String tenantName,
                              String country, String currency, String plan, String adminEmail) {
        super("tenant.created", tenantId);
        this.tenantName = tenantName;
        this.country = country;
        this.currency = currency;
        this.plan = plan;
        this.adminEmail = adminEmail;
    }

    protected TenantCreatedEvent() { super(); this.tenantName = null; this.country = null; this.currency = null; this.plan = null; this.adminEmail = null; }

    public String getTenantName() { return tenantName; }
    public String getCountry() { return country; }
    public String getCurrency() { return currency; }
    public String getPlan() { return plan; }
    public String getAdminEmail() { return adminEmail; }
}