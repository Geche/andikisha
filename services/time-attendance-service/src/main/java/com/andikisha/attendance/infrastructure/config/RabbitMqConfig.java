package com.andikisha.attendance.infrastructure.config;

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

    public static final String ATTENDANCE_EXCHANGE = "attendance.events";
    public static final String LEAVE_EXCHANGE = "leave.events";
    public static final String TENANT_EXCHANGE = "tenant.events";

    @Bean TopicExchange attendanceExchange() {
        return new TopicExchange(ATTENDANCE_EXCHANGE, true, false);
    }

    @Bean TopicExchange leaveExchange() {
        return new TopicExchange(LEAVE_EXCHANGE, true, false);
    }

    @Bean TopicExchange tenantExchange() {
        return new TopicExchange(TENANT_EXCHANGE, true, false);
    }

    @Bean Queue attendanceLeaveEventsQueue() {
        return QueueBuilder.durable("attendance.leave-events")
                .withArgument("x-dead-letter-exchange", "dlx.attendance").build();
    }

    @Bean Queue attendanceTenantEventsQueue() {
        return QueueBuilder.durable("attendance.tenant-events")
                .withArgument("x-dead-letter-exchange", "dlx.attendance").build();
    }

    @Bean Binding bindLeaveEvents() {
        return BindingBuilder.bind(attendanceLeaveEventsQueue())
                .to(leaveExchange()).with("leave.approved");
    }

    @Bean Binding bindTenantEvents() {
        return BindingBuilder.bind(attendanceTenantEventsQueue())
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