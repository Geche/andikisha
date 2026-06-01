package com.andikisha.auth.infrastructure.messaging;

import com.andikisha.auth.application.port.AuthEventPublisher;
import com.andikisha.auth.domain.model.User;
import com.andikisha.auth.infrastructure.config.RabbitMqConfig;
import com.andikisha.events.auth.AdminPasswordResetEvent;
import com.andikisha.events.auth.EmployeeUserProvisionedEvent;
import com.andikisha.events.auth.PasswordResetRequestedEvent;
import com.andikisha.events.auth.UserDeactivatedEvent;
import com.andikisha.events.auth.UserRegisteredEvent;
import com.andikisha.events.auth.UserRoleChangedEvent;
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

    @Override
    public void publishEmployeeUserProvisioned(String tenantId, String employeeId,
                                               String email, String firstName, String lastName,
                                               String employeeNumber, String tempPassword) {
        var event = new EmployeeUserProvisionedEvent(
                tenantId, employeeId, email, firstName, lastName, employeeNumber, tempPassword);
        rabbitTemplate.convertAndSend(RabbitMqConfig.AUTH_EXCHANGE, "auth.employee_provisioned", event);
        log.info("Published EmployeeUserProvisioned for employee={}", employeeId);
    }

    @Override
    public void publishPasswordResetRequested(String tenantId, String email, String resetToken) {
        var event = new PasswordResetRequestedEvent(tenantId, email, resetToken);
        rabbitTemplate.convertAndSend(RabbitMqConfig.AUTH_EXCHANGE, "auth.password_reset_requested", event);
        log.info("Published PasswordResetRequested for email={}", email);
    }

    @Override
    public void publishRoleChanged(String tenantId, String changerId,
                                   String targetUserId, String oldRole, String newRole) {
        var event = new UserRoleChangedEvent(tenantId, changerId, targetUserId, oldRole, newRole);
        rabbitTemplate.convertAndSend(RabbitMqConfig.AUTH_EXCHANGE, "auth.role_changed", event);
        log.info("Published RoleChanged: target={} {} → {}", targetUserId, oldRole, newRole);
    }

    @Override
    public void publishAdminPasswordReset(String tenantId, String performedBy, String targetUserId) {
        var event = new AdminPasswordResetEvent(tenantId, performedBy, targetUserId);
        rabbitTemplate.convertAndSend(RabbitMqConfig.AUTH_EXCHANGE, "auth.admin_password_reset", event);
        log.info("Published AdminPasswordReset: performedBy={} target={}", performedBy, targetUserId);
    }
}