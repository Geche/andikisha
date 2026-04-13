package com.andikisha.leave.infrastructure.config;

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

    public static final String LEAVE_EXCHANGE = "leave.events";
    public static final String EMPLOYEE_EXCHANGE = "employee.events";
    public static final String TENANT_EXCHANGE = "tenant.events";
    public static final String LEAVE_EMPLOYEE_EVENTS_QUEUE = "leave.employee-events";
    public static final String LEAVE_TENANT_EVENTS_QUEUE = "leave.tenant-events";

    // Dead-letter exchange and queues — messages rejected after retry are routed here
    private static final String DLX_EXCHANGE = "dlx.leave";
    private static final String DLQ_EMPLOYEE = "leave.employee-events.dlq";
    private static final String DLQ_TENANT   = "leave.tenant-events.dlq";

    @Bean TopicExchange leaveExchange() {
        return new TopicExchange(LEAVE_EXCHANGE, true, false);
    }

    @Bean TopicExchange employeeExchange() {
        return new TopicExchange(EMPLOYEE_EXCHANGE, true, false);
    }

    @Bean TopicExchange tenantExchange() {
        return new TopicExchange(TENANT_EXCHANGE, true, false);
    }

    @Bean DirectExchange dlxLeaveExchange() {
        return new DirectExchange(DLX_EXCHANGE, true, false);
    }

    @Bean Queue leaveEmployeeEventsQueue() {
        return QueueBuilder.durable(LEAVE_EMPLOYEE_EVENTS_QUEUE)
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLQ_EMPLOYEE)
                .build();
    }

    @Bean Queue leaveTenantEventsQueue() {
        return QueueBuilder.durable(LEAVE_TENANT_EVENTS_QUEUE)
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLQ_TENANT)
                .build();
    }

    @Bean Queue leaveEmployeeDeadLetterQueue() {
        return QueueBuilder.durable(DLQ_EMPLOYEE).build();
    }

    @Bean Queue leaveTenantDeadLetterQueue() {
        return QueueBuilder.durable(DLQ_TENANT).build();
    }

    @Bean Binding bindEmployeeDeadLetterQueue() {
        return BindingBuilder.bind(leaveEmployeeDeadLetterQueue())
                .to(dlxLeaveExchange()).with(DLQ_EMPLOYEE);
    }

    @Bean Binding bindTenantDeadLetterQueue() {
        return BindingBuilder.bind(leaveTenantDeadLetterQueue())
                .to(dlxLeaveExchange()).with(DLQ_TENANT);
    }

    @Bean Binding bindEmployeeEvents() {
        return BindingBuilder.bind(leaveEmployeeEventsQueue())
                .to(employeeExchange()).with("employee.*");
    }

    @Bean Binding bindTenantEvents() {
        return BindingBuilder.bind(leaveTenantEventsQueue())
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