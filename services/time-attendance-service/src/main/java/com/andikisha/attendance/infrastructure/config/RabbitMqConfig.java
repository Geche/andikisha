package com.andikisha.attendance.infrastructure.config;

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

    public static final String ATTENDANCE_EXCHANGE = "attendance.events";
    public static final String LEAVE_EXCHANGE = "leave.events";
    public static final String TENANT_EXCHANGE = "tenant.events";

    // Dead-letter exchange and queues — messages rejected after retry are routed here
    private static final String DLX_EXCHANGE    = "dlx.attendance";
    private static final String DLQ_LEAVE       = "attendance.leave-events.dlq";
    private static final String DLQ_TENANT      = "attendance.tenant-events.dlq";

    @Bean TopicExchange attendanceExchange() {
        return new TopicExchange(ATTENDANCE_EXCHANGE, true, false);
    }

    @Bean TopicExchange leaveExchange() {
        return new TopicExchange(LEAVE_EXCHANGE, true, false);
    }

    @Bean TopicExchange tenantExchange() {
        return new TopicExchange(TENANT_EXCHANGE, true, false);
    }

    @Bean DirectExchange dlxAttendanceExchange() {
        return new DirectExchange(DLX_EXCHANGE, true, false);
    }

    @Bean Queue attendanceLeaveEventsQueue() {
        return QueueBuilder.durable("attendance.leave-events")
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLQ_LEAVE)
                .build();
    }

    @Bean Queue attendanceTenantEventsQueue() {
        return QueueBuilder.durable("attendance.tenant-events")
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLQ_TENANT)
                .build();
    }

    @Bean Queue attendanceLeaveDeadLetterQueue() {
        return QueueBuilder.durable(DLQ_LEAVE).build();
    }

    @Bean Queue attendanceTenantDeadLetterQueue() {
        return QueueBuilder.durable(DLQ_TENANT).build();
    }

    @Bean Binding bindLeaveDeadLetterQueue() {
        return BindingBuilder.bind(attendanceLeaveDeadLetterQueue())
                .to(dlxAttendanceExchange()).with(DLQ_LEAVE);
    }

    @Bean Binding bindTenantDeadLetterQueue() {
        return BindingBuilder.bind(attendanceTenantDeadLetterQueue())
                .to(dlxAttendanceExchange()).with(DLQ_TENANT);
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

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            Jackson2JsonMessageConverter messageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter);
        factory.setDefaultRequeueRejected(false);
        factory.setPrefetchCount(10);
        return factory;
    }
}