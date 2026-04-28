package com.andikisha.events.tenant;

import com.andikisha.common.domain.model.BillingCycle;
import com.andikisha.events.BaseEvent;

import java.math.BigDecimal;
import java.time.LocalDate;

public class LicenceRenewedEvent extends BaseEvent {

    private String licenceId;
    private String planName;
    private String newEndDate;
    private BigDecimal agreedPriceKes;
    private String billingCycle;
    private String renewedBy;

    public LicenceRenewedEvent(String tenantId, String licenceId, String planName,
                               LocalDate newEndDate, BigDecimal agreedPriceKes,
                               BillingCycle billingCycle, String renewedBy) {
        super("licence.renewed", tenantId);
        this.licenceId = licenceId;
        this.planName = planName;
        this.newEndDate = newEndDate.toString();
        this.agreedPriceKes = agreedPriceKes;
        this.billingCycle = billingCycle.name();
        this.renewedBy = renewedBy;
    }

    protected LicenceRenewedEvent() { super(); }

    public String getLicenceId() { return licenceId; }
    public String getPlanName() { return planName; }
    public String getNewEndDate() { return newEndDate; }
    public BigDecimal getAgreedPriceKes() { return agreedPriceKes; }
    public String getBillingCycle() { return billingCycle; }
    public String getRenewedBy() { return renewedBy; }
}
