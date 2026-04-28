package com.andikisha.compliance.infrastructure.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    public static final String PAYROLL_EXCHANGE         = "payroll.events";
    public static final String COMPLIANCE_PAYROLL_QUEUE = "compliance.payroll-events";
    public static final String COMPLIANCE_DLX           = "dlx.compliance";
    public static final String COMPLIANCE_DLQ           = "dlq.compliance.payroll-events";

    @Bean TopicExchange payrollExchange() {
        return new TopicExchange(PAYROLL_EXCHANGE, true, false);
    }

    @Bean Queue compliancePayrollQueue() {
        return QueueBuilder.durable(COMPLIANCE_PAYROLL_QUEUE)
                .withArgument("x-dead-letter-exchange", "dlx.compliance")
                .build();
    }

    @Bean Binding bindPayrollEvents() {
        return BindingBuilder.bind(compliancePayrollQueue())
                .to(payrollExchange()).with("payroll.processed");
    }

    @Bean
    DirectExchange complianceDeadLetterExchange() {
        return new DirectExchange(COMPLIANCE_DLX, true, false);
    }

    @Bean
    Queue complianceDeadLetterQueue() {
        return QueueBuilder.durable(COMPLIANCE_DLQ).build();
    }

    @Bean
    Binding bindComplianceDlq() {
        return BindingBuilder.bind(complianceDeadLetterQueue())
                .to(complianceDeadLetterExchange())
                .with(COMPLIANCE_PAYROLL_QUEUE);
    }

    @Bean Jackson2JsonMessageConverter messageConverter(ObjectMapper objectMapper) {
        return new Jackson2JsonMessageConverter(objectMapper);
    }

    /**
     * Listener container with defaultRequeueRejected=false:
     * when the listener throws an unchecked exception the message is NACKed and
     * routed to dlx.compliance instead of being re-queued indefinitely.
     */
    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory,
            Jackson2JsonMessageConverter messageConverter) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter);
        factory.setDefaultRequeueRejected(false);
        return factory;
    }
}
