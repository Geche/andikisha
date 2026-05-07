package com.andikisha.gateway.infrastructure.messaging;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GatewayRabbitMqConfig {

    public static final String PAYROLL_EXCHANGE = "payroll.events";
    public static final String GATEWAY_PAYROLL_QUEUE = "gateway.payroll-lock-release";

    @Bean
    TopicExchange gatewayPayrollExchange() {
        return new TopicExchange(PAYROLL_EXCHANGE, true, false);
    }

    @Bean
    Queue gatewayPayrollLockReleaseQueue() {
        return QueueBuilder.durable(GATEWAY_PAYROLL_QUEUE).build();
    }

    @Bean
    Binding gatewayPayrollBinding() {
        return BindingBuilder.bind(gatewayPayrollLockReleaseQueue())
                .to(gatewayPayrollExchange())
                .with("payroll.processed");
    }

    @Bean
    Jackson2JsonMessageConverter gatewayMessageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            Jackson2JsonMessageConverter gatewayMessageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(gatewayMessageConverter);
        factory.setDefaultRequeueRejected(false);
        factory.setPrefetchCount(10);
        return factory;
    }
}
