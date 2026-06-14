package com.andikisha.auth.infrastructure.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    public static final String AUTH_EXCHANGE = "auth.events";
    public static final String EMPLOYEE_EXCHANGE = "employee.events";
    public static final String EMPLOYEE_CREATED_QUEUE = "auth.employee.created";
    public static final String EMPLOYEE_UPDATED_QUEUE = "auth.employee.updated";

    @Bean
    TopicExchange employeeExchange() {
        return new TopicExchange(EMPLOYEE_EXCHANGE, true, false);
    }

    @Bean
    Queue employeeCreatedQueue() {
        return new Queue(EMPLOYEE_CREATED_QUEUE, true);
    }

    @Bean
    Binding employeeCreatedBinding(Queue employeeCreatedQueue, TopicExchange employeeExchange) {
        return BindingBuilder.bind(employeeCreatedQueue)
                .to(employeeExchange)
                .with("employee.created");
    }

    // AUTH-007: keep users.display_name in sync when an employee is renamed.
    @Bean
    Queue employeeUpdatedQueue() {
        return new Queue(EMPLOYEE_UPDATED_QUEUE, true);
    }

    @Bean
    Binding employeeUpdatedBinding(Queue employeeUpdatedQueue, TopicExchange employeeExchange) {
        return BindingBuilder.bind(employeeUpdatedQueue)
                .to(employeeExchange)
                .with("employee.updated");
    }

    @Bean
    TopicExchange authExchange() {
        return new TopicExchange(AUTH_EXCHANGE, true, false);
    }

    @Bean
    Jackson2JsonMessageConverter messageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory,
                                  Jackson2JsonMessageConverter converter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(converter);
        return template;
    }
}