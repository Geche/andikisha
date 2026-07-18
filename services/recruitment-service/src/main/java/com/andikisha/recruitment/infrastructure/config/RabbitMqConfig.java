package com.andikisha.recruitment.infrastructure.config;

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

/**
 * RabbitMQ topology for recruitment events. Mirrors employee-service's RabbitMqConfig: a durable
 * topic exchange plus a dead-letter exchange/queue pair.
 */
@Configuration
public class RabbitMqConfig {

    public static final String RECRUITMENT_EXCHANGE = "recruitment.events";
    public static final String DLX_EXCHANGE         = "dlx.recruitment";
    public static final String DLQ_NAME             = "dlq.recruitment";
    public static final String DLQ_ROUTING_KEY      = "dlq.recruitment";

    @Bean
    TopicExchange recruitmentExchange() {
        return new TopicExchange(RECRUITMENT_EXCHANGE, true, false);
    }

    @Bean
    DirectExchange recruitmentDeadLetterExchange() {
        return new DirectExchange(DLX_EXCHANGE, true, false);
    }

    @Bean
    Queue recruitmentDeadLetterQueue() {
        return QueueBuilder.durable(DLQ_NAME).build();
    }

    /** Binds the DLQ to the DLX so undeliverable messages are captured. */
    @Bean
    Binding recruitmentDeadLetterBinding() {
        return BindingBuilder.bind(recruitmentDeadLetterQueue())
                .to(recruitmentDeadLetterExchange())
                .with(DLQ_ROUTING_KEY);
    }

    @Bean
    Jackson2JsonMessageConverter recruitmentMessageConverter(ObjectMapper objectMapper) {
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
