package com.andikisha.events.tenant;

import com.andikisha.events.BaseEvent;

public class TenantPlanChangedEvent extends BaseEvent {

    private String oldPlan;
    private String newPlan;

    public TenantPlanChangedEvent(String tenantId, String oldPlan, String newPlan) {
        super("tenant.plan_changed", tenantId);
        this.oldPlan = oldPlan;
        this.newPlan = newPlan;
    }

    protected TenantPlanChangedEvent() { super(); }

    public String getOldPlan() { return oldPlan; }
    public String getNewPlan() { return newPlan; }
}