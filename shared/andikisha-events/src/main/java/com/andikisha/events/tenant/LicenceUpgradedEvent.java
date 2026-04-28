package com.andikisha.events.tenant;

import com.andikisha.events.BaseEvent;

import java.math.BigDecimal;

public class LicenceUpgradedEvent extends BaseEvent {

    private String licenceId;
    private String previousPlanName;
    private String newPlanName;
    private int newSeatCount;
    private BigDecimal newAgreedPriceKes;
    private String upgradedBy;

    public LicenceUpgradedEvent(String tenantId, String licenceId, String previousPlanName,
                                String newPlanName, int newSeatCount,
                                BigDecimal newAgreedPriceKes, String upgradedBy) {
        super("licence.upgraded", tenantId);
        this.licenceId = licenceId;
        this.previousPlanName = previousPlanName;
        this.newPlanName = newPlanName;
        this.newSeatCount = newSeatCount;
        this.newAgreedPriceKes = newAgreedPriceKes;
        this.upgradedBy = upgradedBy;
    }

    protected LicenceUpgradedEvent() { super(); }

    public String getLicenceId() { return licenceId; }
    public String getPreviousPlanName() { return previousPlanName; }
    public String getNewPlanName() { return newPlanName; }
    public int getNewSeatCount() { return newSeatCount; }
    public BigDecimal getNewAgreedPriceKes() { return newAgreedPriceKes; }
    public String getUpgradedBy() { return upgradedBy; }
}
