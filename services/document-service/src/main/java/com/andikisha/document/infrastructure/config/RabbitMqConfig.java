package com.andikisha.document.infrastructure.config;

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

    public static final String DOCUMENT_EXCHANGE          = "document.events";
    public static final String PAYROLL_EXCHANGE           = "payroll.events";
    public static final String EMPLOYEE_EXCHANGE          = "employee.events";
    public static final String DOCUMENT_PAYROLL_QUEUE     = "document.payroll-events";
    public static final String DOCUMENT_EMPLOYEE_QUEUE    = "document.employee-events";
    private static final String DOCUMENT_DLX              = "document.events.dlx";
    private static final String DOCUMENT_DLQ              = "document.events.dlq";

    // Dead-letter exchange + parking queue
    @Bean DirectExchange documentDlx() {
        return new DirectExchange(DOCUMENT_DLX, true, false);
    }

    @Bean Queue documentDlq() {
        return QueueBuilder.durable(DOCUMENT_DLQ).build();
    }

    @Bean Binding bindDlq() {
        return BindingBuilder.bind(documentDlq()).to(documentDlx()).with("");
    }

    // Exchanges
    @Bean TopicExchange documentExchange() {
        return new TopicExchange(DOCUMENT_EXCHANGE, true, false);
    }

    @Bean TopicExchange payrollExchange() {
        return new TopicExchange(PAYROLL_EXCHANGE, true, false);
    }

    @Bean TopicExchange employeeExchange() {
        return new TopicExchange(EMPLOYEE_EXCHANGE, true, false);
    }

    // Queues — both protected by the dead-letter exchange
    @Bean Queue documentPayrollQueue() {
        return QueueBuilder.durable(DOCUMENT_PAYROLL_QUEUE)
                .withArgument("x-dead-letter-exchange", DOCUMENT_DLX)
                .build();
    }

    @Bean Queue documentEmployeeQueue() {
        return QueueBuilder.durable(DOCUMENT_EMPLOYEE_QUEUE)
                .withArgument("x-dead-letter-exchange", DOCUMENT_DLX)
                .build();
    }

    // Bindings — C2 fix: listen to payroll.processed (not payroll.approved)
    @Bean Binding bindPayrollEvents() {
        return BindingBuilder.bind(documentPayrollQueue())
                .to(payrollExchange()).with("payroll.processed");
    }

    @Bean Binding bindEmployeeEvents() {
        return BindingBuilder.bind(documentEmployeeQueue())
                .to(employeeExchange()).with("employee.terminated");
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
