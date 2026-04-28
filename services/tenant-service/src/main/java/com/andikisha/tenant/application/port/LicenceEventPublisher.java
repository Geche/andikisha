package com.andikisha.tenant.application.port;

import com.andikisha.events.tenant.LicenceExpiringEvent;
import com.andikisha.events.tenant.LicenceRenewedEvent;
import com.andikisha.events.tenant.LicenceUpgradedEvent;
import com.andikisha.events.tenant.TenantReactivatedEvent;
import com.andikisha.events.tenant.TenantSuspendedEvent;

/**
 * Outbound port for publishing licence and tenant lifecycle events.
 * Implementations live in the infrastructure layer (RabbitMQ).
 *
 * Domain services depend only on this interface — they MUST NOT
 * import RabbitTemplate or any AMQP type directly.
 */
public interface LicenceEventPublisher {

    void publishTenantSuspended(TenantSuspendedEvent event);

    void publishTenantReactivated(TenantReactivatedEvent event);

    void publishLicenceRenewed(LicenceRenewedEvent event);

    void publishLicenceExpiring(LicenceExpiringEvent event);

    void publishLicenceUpgraded(LicenceUpgradedEvent event);
}
