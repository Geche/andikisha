package com.andikisha.events.tenant;

import com.andikisha.events.BaseEvent;

public class TenantPlanChangedEvent extends BaseEvent {

    private final String oldPlan;
    private final String newPlan;

    public TenantPlanChangedEvent(String tenantId, String oldPlan, String newPlan) {
        super("tenant.plan_changed", tenantId);
        this.oldPlan = oldPlan;
        this.newPlan = newPlan;
    }

    protected TenantPlanChangedEvent() { super(); this.oldPlan = null; this.newPlan = null; }

    public String getOldPlan() { return oldPlan; }
    public String getNewPlan() { return newPlan; }
}