package com.andikisha.notification.infrastructure.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
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

    // Dead-letter exchange and parking queue for failed notification messages
    @Bean DirectExchange notificationDlx() {
        return new DirectExchange("dlx.notification", true, false);
    }

    @Bean Queue notificationDlq() {
        return QueueBuilder.durable("dlq.notification").build();
    }

    @Bean Binding bindDlq() {
        return BindingBuilder.bind(notificationDlq()).to(notificationDlx()).with("");
    }

    // Exchanges (declared idempotently, same as in publishing services)
    @Bean TopicExchange employeeExchange() {
        return new TopicExchange("employee.events", true, false);
    }
    @Bean TopicExchange payrollExchange() {
        return new TopicExchange("payroll.events", true, false);
    }
    @Bean TopicExchange leaveExchange() {
        return new TopicExchange("leave.events", true, false);
    }
    @Bean TopicExchange tenantExchange() {
        return new TopicExchange("tenant.events", true, false);
    }
    // Queues
    @Bean Queue notificationEmployeeQueue() {
        return QueueBuilder.durable("notification.employee-events")
                .withArgument("x-dead-letter-exchange", "dlx.notification").build();
    }
    @Bean Queue notificationPayrollQueue() {
        return QueueBuilder.durable("notification.payroll-events")
                .withArgument("x-dead-letter-exchange", "dlx.notification").build();
    }
    @Bean Queue notificationLeaveQueue() {
        return QueueBuilder.durable("notification.leave-events")
                .withArgument("x-dead-letter-exchange", "dlx.notification").build();
    }
    @Bean Queue notificationTenantQueue() {
        return QueueBuilder.durable("notification.tenant-events")
                .withArgument("x-dead-letter-exchange", "dlx.notification").build();
    }

    // Bindings
    @Bean Binding bindEmployee() {
        return BindingBuilder.bind(notificationEmployeeQueue())
                .to(employeeExchange()).with("employee.*");
    }
    @Bean Binding bindPayroll() {
        return BindingBuilder.bind(notificationPayrollQueue())
                .to(payrollExchange()).with("payroll.*");
    }
    @Bean Binding bindLeave() {
        return BindingBuilder.bind(notificationLeaveQueue())
                .to(leaveExchange()).with("leave.*");
    }
    @Bean Binding bindTenant() {
        return BindingBuilder.bind(notificationTenantQueue())
                .to(tenantExchange()).with("tenant.created");
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