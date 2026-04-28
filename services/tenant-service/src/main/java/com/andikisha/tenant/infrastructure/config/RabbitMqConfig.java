package com.andikisha.tenant.infrastructure.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    public static final String TENANT_EXCHANGE = "tenant.events";

    /**
     * Dedicated exchange for licence-lifecycle events. Kept separate from the
     * legacy {@link #TENANT_EXCHANGE} so consumers can subscribe to licence
     * events alone without filtering through unrelated tenant CRUD events.
     */
    public static final String LICENCE_EXCHANGE = "andikisha.tenant.events";

    @Bean
    TopicExchange tenantExchange() {
        return new TopicExchange(TENANT_EXCHANGE, true, false);
    }

    @Bean
    TopicExchange licenceExchange() {
        return new TopicExchange(LICENCE_EXCHANGE, true, false);
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