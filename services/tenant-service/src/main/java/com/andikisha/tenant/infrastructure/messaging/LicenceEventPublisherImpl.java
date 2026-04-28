package com.andikisha.tenant.infrastructure.messaging;

import com.andikisha.events.tenant.LicenceExpiringEvent;
import com.andikisha.events.tenant.LicenceRenewedEvent;
import com.andikisha.events.tenant.LicenceUpgradedEvent;
import com.andikisha.events.tenant.TenantReactivatedEvent;
import com.andikisha.events.tenant.TenantSuspendedEvent;
import com.andikisha.tenant.application.port.LicenceEventPublisher;
import com.andikisha.tenant.infrastructure.config.RabbitMqConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class LicenceEventPublisherImpl implements LicenceEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(LicenceEventPublisherImpl.class);

    private static final String RK_TENANT_SUSPENDED   = "tenant.suspended";
    private static final String RK_TENANT_REACTIVATED = "tenant.reactivated";
    private static final String RK_LICENCE_RENEWED    = "licence.renewed";
    private static final String RK_LICENCE_EXPIRING   = "licence.expiring";
    private static final String RK_LICENCE_UPGRADED   = "licence.upgraded";

    private final RabbitTemplate rabbitTemplate;

    public LicenceEventPublisherImpl(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public void publishTenantSuspended(TenantSuspendedEvent event) {
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.LICENCE_EXCHANGE, RK_TENANT_SUSPENDED, event);
        log.info("Published tenant.suspended for tenant={}", event.getTenantId());
    }

    @Override
    public void publishTenantReactivated(TenantReactivatedEvent event) {
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.LICENCE_EXCHANGE, RK_TENANT_REACTIVATED, event);
        log.info("Published tenant.reactivated for tenant={}", event.getTenantId());
    }

    @Override
    public void publishLicenceRenewed(LicenceRenewedEvent event) {
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.LICENCE_EXCHANGE, RK_LICENCE_RENEWED, event);
        log.info("Published licence.renewed for tenant={} licence={}",
                event.getTenantId(), event.getLicenceId());
    }

    @Override
    public void publishLicenceExpiring(LicenceExpiringEvent event) {
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.LICENCE_EXCHANGE, RK_LICENCE_EXPIRING, event);
        log.info("Published licence.expiring for tenant={} daysUntilExpiry={}",
                event.getTenantId(), event.getDaysUntilExpiry());
    }

    @Override
    public void publishLicenceUpgraded(LicenceUpgradedEvent event) {
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.LICENCE_EXCHANGE, RK_LICENCE_UPGRADED, event);
        log.info("Published licence.upgraded for tenant={} licence={}",
                event.getTenantId(), event.getLicenceId());
    }
}
