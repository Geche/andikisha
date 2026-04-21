package com.andikisha.integration.infrastructure.config;

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

    private static final String INTEGRATION_EXCHANGE = "integration.events";
    private static final String PAYROLL_EXCHANGE = "payroll.events";
    private static final String INTEGRATION_DLX = "integration.dlx";
    private static final String PAYROLL_EVENTS_QUEUE = "integration.payroll-events";
    private static final String PAYROLL_EVENTS_DLQ = "integration.payroll-events.dlq";

    @Bean TopicExchange integrationExchange() {
        return new TopicExchange(INTEGRATION_EXCHANGE, true, false);
    }

    @Bean TopicExchange payrollExchange() {
        return new TopicExchange(PAYROLL_EXCHANGE, true, false);
    }

    @Bean DirectExchange integrationDlx() {
        return new DirectExchange(INTEGRATION_DLX, true, false);
    }

    @Bean Queue integrationPayrollQueue() {
        return QueueBuilder.durable(PAYROLL_EVENTS_QUEUE)
                .deadLetterExchange(INTEGRATION_DLX)
                .deadLetterRoutingKey(PAYROLL_EVENTS_DLQ)
                .build();
    }

    @Bean Queue integrationPayrollDlq() {
        return QueueBuilder.durable(PAYROLL_EVENTS_DLQ).build();
    }

    @Bean Binding bindPayrollApproved() {
        return BindingBuilder.bind(integrationPayrollQueue())
                .to(payrollExchange()).with("payroll.approved");
    }

    @Bean Binding bindPayrollDlq() {
        return BindingBuilder.bind(integrationPayrollDlq())
                .to(integrationDlx()).with(PAYROLL_EVENTS_DLQ);
    }

    @Bean Jackson2JsonMessageConverter messageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean RabbitTemplate rabbitTemplate(ConnectionFactory cf,
                                        Jackson2JsonMessageConverter conv) {
        RabbitTemplate t = new RabbitTemplate(cf);
        t.setMessageConverter(conv);
        return t;
    }
}
