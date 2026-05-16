package com.andikisha.payroll.infrastructure.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    public static final String PAYROLL_EXCHANGE = "payroll.events";
    public static final String EMPLOYEE_EXCHANGE = "employee.events";
    public static final String INTEGRATION_EXCHANGE = "integration.events";
    public static final String PAYROLL_EMPLOYEE_EVENTS_QUEUE = "payroll.employee-events";
    public static final String PAYROLL_PAYMENT_EVENTS_QUEUE = "payroll.payment-events";
    public static final String PAYROLL_PER_PAYMENT_QUEUE = "payroll.per-payment-events";
    public static final String PAYROLL_DLX = "dlx.payroll";
    public static final String PAYROLL_DLQ = "dlq.payroll.employee-events";
    public static final String PAYROLL_PAYMENT_DLQ = "dlq.payroll.payment-events";
    public static final String PAYROLL_PER_PAYMENT_DLQ = "dlq.payroll.per-payment-events";

    @Bean
    TopicExchange payrollExchange() {
        return new TopicExchange(PAYROLL_EXCHANGE, true, false);
    }

    @Bean
    TopicExchange employeeExchange() {
        return new TopicExchange(EMPLOYEE_EXCHANGE, true, false);
    }

    @Bean
    TopicExchange integrationExchange() {
        return new TopicExchange(INTEGRATION_EXCHANGE, true, false);
    }

    @Bean
    Queue payrollPaymentEventsQueue() {
        return QueueBuilder.durable(PAYROLL_PAYMENT_EVENTS_QUEUE)
                .withArgument("x-dead-letter-exchange", "dlx.payroll")
                .build();
    }

    @Bean
    Binding bindPaymentsCompletedToPayroll() {
        return BindingBuilder.bind(payrollPaymentEventsQueue())
                .to(integrationExchange())
                .with("payments.completed");
    }

    @Bean
    Queue payrollPaymentDeadLetterQueue() {
        return QueueBuilder.durable(PAYROLL_PAYMENT_DLQ).build();
    }

    @Bean
    Binding bindPayrollPaymentDlq() {
        return BindingBuilder.bind(payrollPaymentDeadLetterQueue())
                .to(payrollDeadLetterExchange())
                .with(PAYROLL_PAYMENT_EVENTS_QUEUE);
    }

    @Bean
    Queue payrollPerPaymentEventsQueue() {
        return QueueBuilder.durable(PAYROLL_PER_PAYMENT_QUEUE)
                .withArgument("x-dead-letter-exchange", PAYROLL_DLX)
                .build();
    }

    @Bean
    Binding bindPerPaymentEventsToPayroll() {
        return BindingBuilder.bind(payrollPerPaymentEventsQueue())
                .to(integrationExchange())
                .with("payment.*");
    }

    @Bean
    Queue payrollPerPaymentDeadLetterQueue() {
        return QueueBuilder.durable(PAYROLL_PER_PAYMENT_DLQ).build();
    }

    @Bean
    Binding bindPayrollPerPaymentDlq() {
        return BindingBuilder.bind(payrollPerPaymentDeadLetterQueue())
                .to(payrollDeadLetterExchange())
                .with(PAYROLL_PER_PAYMENT_QUEUE);
    }

    @Bean
    Queue payrollEmployeeEventsQueue() {
        return QueueBuilder.durable(PAYROLL_EMPLOYEE_EVENTS_QUEUE)
                .withArgument("x-dead-letter-exchange", "dlx.payroll")
                .build();
    }

    @Bean
    Binding bindEmployeeEventsToPayroll() {
        return BindingBuilder.bind(payrollEmployeeEventsQueue())
                .to(employeeExchange())
                .with("employee.*");
    }

    @Bean
    DirectExchange payrollDeadLetterExchange() {
        return new DirectExchange(PAYROLL_DLX, true, false);
    }

    @Bean
    Queue payrollDeadLetterQueue() {
        return QueueBuilder.durable(PAYROLL_DLQ).build();
    }

    @Bean
    Binding bindPayrollDlq() {
        return BindingBuilder.bind(payrollDeadLetterQueue())
                .to(payrollDeadLetterExchange())
                .with(PAYROLL_EMPLOYEE_EVENTS_QUEUE);
    }

    @Bean
    Jackson2JsonMessageConverter messageConverter(ObjectMapper objectMapper) {
        Jackson2JsonMessageConverter converter = new Jackson2JsonMessageConverter(objectMapper);
        converter.setTypePrecedence(org.springframework.amqp.support.converter.DefaultJackson2JavaTypeMapper.TypePrecedence.INFERRED);
        return converter;
    }

    @Bean
    RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                  Jackson2JsonMessageConverter converter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(converter);
        return template;
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            Jackson2JsonMessageConverter messageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter);
        factory.setDefaultRequeueRejected(false);
        factory.setPrefetchCount(5);
        return factory;
    }
}