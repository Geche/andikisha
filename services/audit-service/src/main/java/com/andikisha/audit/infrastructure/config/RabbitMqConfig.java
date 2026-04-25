package com.andikisha.audit.infrastructure.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    // Exchanges
    @Bean TopicExchange authExchange() {
        return new TopicExchange("auth.events", true, false);
    }
    @Bean TopicExchange employeeExchange() {
        return new TopicExchange("employee.events", true, false);
    }
    @Bean TopicExchange tenantExchange() {
        return new TopicExchange("tenant.events", true, false);
    }
    @Bean TopicExchange payrollExchange() {
        return new TopicExchange("payroll.events", true, false);
    }
    @Bean TopicExchange leaveExchange() {
        return new TopicExchange("leave.events", true, false);
    }
    @Bean TopicExchange attendanceExchange() {
        return new TopicExchange("attendance.events", true, false);
    }
    @Bean TopicExchange documentExchange() {
        return new TopicExchange("document.events", true, false);
    }
    @Bean TopicExchange integrationExchange() {
        return new TopicExchange("integration.events", true, false);
    }

    // Queues
    @Bean Queue auditAuthQueue() {
        return QueueBuilder.durable("audit.auth-events").build();
    }
    @Bean Queue auditEmployeeQueue() {
        return QueueBuilder.durable("audit.employee-events").build();
    }
    @Bean Queue auditTenantQueue() {
        return QueueBuilder.durable("audit.tenant-events").build();
    }
    @Bean Queue auditPayrollQueue() {
        return QueueBuilder.durable("audit.payroll-events").build();
    }
    @Bean Queue auditLeaveQueue() {
        return QueueBuilder.durable("audit.leave-events").build();
    }
    @Bean Queue auditAttendanceQueue() {
        return QueueBuilder.durable("audit.attendance-events").build();
    }
    @Bean Queue auditDocumentQueue() {
        return QueueBuilder.durable("audit.document-events").build();
    }
    @Bean Queue auditIntegrationQueue() {
        return QueueBuilder.durable("audit.integration-events").build();
    }

    // Bindings
    @Bean Binding bindAuth() {
        return BindingBuilder.bind(auditAuthQueue())
                .to(authExchange()).with("#");
    }
    @Bean Binding bindEmployee() {
        return BindingBuilder.bind(auditEmployeeQueue())
                .to(employeeExchange()).with("#");
    }
    @Bean Binding bindTenant() {
        return BindingBuilder.bind(auditTenantQueue())
                .to(tenantExchange()).with("#");
    }
    @Bean Binding bindPayroll() {
        return BindingBuilder.bind(auditPayrollQueue())
                .to(payrollExchange()).with("#");
    }
    @Bean Binding bindLeave() {
        return BindingBuilder.bind(auditLeaveQueue())
                .to(leaveExchange()).with("#");
    }
    @Bean Binding bindAttendance() {
        return BindingBuilder.bind(auditAttendanceQueue())
                .to(attendanceExchange()).with("#");
    }
    @Bean Binding bindDocument() {
        return BindingBuilder.bind(auditDocumentQueue())
                .to(documentExchange()).with("#");
    }
    @Bean Binding bindIntegration() {
        return BindingBuilder.bind(auditIntegrationQueue())
                .to(integrationExchange()).with("#");
    }

    @Bean Jackson2JsonMessageConverter messageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }
    @Bean RabbitTemplate rabbitTemplate(ConnectionFactory cf, Jackson2JsonMessageConverter conv) {
        RabbitTemplate t = new RabbitTemplate(cf);
        t.setMessageConverter(conv);
        return t;
    }
}