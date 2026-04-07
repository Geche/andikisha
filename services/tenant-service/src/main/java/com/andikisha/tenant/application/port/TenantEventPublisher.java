package com.andikisha.tenant.application.port;

import com.andikisha.tenant.domain.model.Tenant;

public interface TenantEventPublisher {

    void publishTenantCreated(Tenant tenant);

    void publishTenantSuspended(String tenantId, String reason);

    void publishTenantPlanChanged(String tenantId, String oldPlan, String newPlan);

    void publishTenantReactivated(String tenantId);
}