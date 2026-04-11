package com.andikisha.leave.infrastructure.messaging;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.tenant.TenantCreatedEvent;
import com.andikisha.leave.application.service.LeavePolicyService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class TenantEventListener {

    private static final Logger log = LoggerFactory.getLogger(TenantEventListener.class);
    private final LeavePolicyService policyService;

    public TenantEventListener(LeavePolicyService policyService) {
        this.policyService = policyService;
    }

    @RabbitListener(queues = "leave.tenant-events")
    public void handle(BaseEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            if (event instanceof TenantCreatedEvent e) {
                policyService.initializeDefaultPolicies(e.getTenantId());
                log.info("Initialized default leave policies for tenant {}", e.getTenantId());
            }
        } finally {
            TenantContext.clear();
        }
    }
}