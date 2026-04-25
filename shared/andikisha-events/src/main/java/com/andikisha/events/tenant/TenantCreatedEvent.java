package com.andikisha.events.tenant;

import com.andikisha.events.BaseEvent;

public class TenantCreatedEvent extends BaseEvent {

    private String tenantName;
    private String country;
    private String currency;
    private String plan;
    private String adminEmail;

    public TenantCreatedEvent(String tenantId, String tenantName,
                              String country, String currency, String plan, String adminEmail) {
        super("tenant.created", tenantId);
        this.tenantName = tenantName;
        this.country = country;
        this.currency = currency;
        this.plan = plan;
        this.adminEmail = adminEmail;
    }

    protected TenantCreatedEvent() { super(); }

    public String getTenantName() { return tenantName; }
    public String getCountry() { return country; }
    public String getCurrency() { return currency; }
    public String getPlan() { return plan; }
    public String getAdminEmail() { return adminEmail; }
}