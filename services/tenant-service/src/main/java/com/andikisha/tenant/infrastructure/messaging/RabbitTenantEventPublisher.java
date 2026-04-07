package com.andikisha.tenant.infrastructure.messaging;

import com.andikisha.events.tenant.TenantCreatedEvent;
import com.andikisha.events.tenant.TenantPlanChangedEvent;
import com.andikisha.events.tenant.TenantReactivatedEvent;
import com.andikisha.events.tenant.TenantSuspendedEvent;
import com.andikisha.tenant.application.port.TenantEventPublisher;
import com.andikisha.tenant.domain.model.Tenant;
import com.andikisha.tenant.infrastructure.config.RabbitMqConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class RabbitTenantEventPublisher implements TenantEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(RabbitTenantEventPublisher.class);
    private final RabbitTemplate rabbitTemplate;

    public RabbitTenantEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public void publishTenantCreated(Tenant tenant) {
        var event = new TenantCreatedEvent(
                tenant.getTenantId(),
                tenant.getCompanyName(),
                tenant.getCountry(),
                tenant.getCurrency(),
                tenant.getPlan().getName(),
                tenant.getAdminEmail()
        );
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.TENANT_EXCHANGE, "tenant.created", event);
        log.info("Published tenant created event for: {}", tenant.getCompanyName());
    }

    @Override
    public void publishTenantSuspended(String tenantId, String reason) {
        var event = new TenantSuspendedEvent(tenantId, reason);
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.TENANT_EXCHANGE, "tenant.suspended", event);
        log.info("Published tenant suspended event for tenant: {}", tenantId);
    }

    @Override
    public void publishTenantPlanChanged(String tenantId, String oldPlan, String newPlan) {
        var event = new TenantPlanChangedEvent(tenantId, oldPlan, newPlan);
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.TENANT_EXCHANGE, "tenant.plan_changed", event);
        log.info("Published plan change for tenant: {} from {} to {}",
                tenantId, oldPlan, newPlan);
    }

    @Override
    public void publishTenantReactivated(String tenantId) {
        var event = new TenantReactivatedEvent(tenantId);
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.TENANT_EXCHANGE, "tenant.reactivated", event);
        log.info("Published tenant reactivated event for tenant: {}", tenantId);
    }
}