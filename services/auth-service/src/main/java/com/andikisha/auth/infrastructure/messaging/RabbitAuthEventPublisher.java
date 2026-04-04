package com.andikisha.auth.infrastructure.messaging;

import com.andikisha.auth.application.port.AuthEventPublisher;
import com.andikisha.auth.domain.model.User;
import com.andikisha.auth.infrastructure.config.RabbitMqConfig;
import com.andikisha.events.auth.UserDeactivatedEvent;
import com.andikisha.events.auth.UserRegisteredEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

@Component
public class RabbitAuthEventPublisher implements AuthEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(RabbitAuthEventPublisher.class);
    private final RabbitTemplate rabbitTemplate;

    public RabbitAuthEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public void publishUserRegistered(User user) {
        var event = new UserRegisteredEvent(
                user.getTenantId(),
                user.getId().toString(),
                user.getEmail(),
                user.getRole().name()
        );
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.AUTH_EXCHANGE, "auth.user_registered", event);
        log.info("Published user registered event for user: {}", user.getEmail());
    }

    @Override
    public void publishUserDeactivated(String tenantId, String userId) {
        var event = new UserDeactivatedEvent(tenantId, userId);
        rabbitTemplate.convertAndSend(
                RabbitMqConfig.AUTH_EXCHANGE, "auth.user_deactivated", event);
        log.info("Published user deactivated event for user: {}", userId);
    }
}