package com.andikisha.analytics.infrastructure.config;

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

    @Bean TopicExchange payrollExchange() {
        return new TopicExchange("payroll.events", true, false);
    }
    @Bean TopicExchange employeeExchange() {
        return new TopicExchange("employee.events", true, false);
    }
    @Bean TopicExchange leaveExchange() {
        return new TopicExchange("leave.events", true, false);
    }
    @Bean TopicExchange attendanceExchange() {
        return new TopicExchange("attendance.events", true, false);
    }

    @Bean Queue analyticsPayrollQueue() {
        return QueueBuilder.durable("analytics.payroll-events").build();
    }
    @Bean Queue analyticsEmployeeQueue() {
        return QueueBuilder.durable("analytics.employee-events").build();
    }
    @Bean Queue analyticsLeaveQueue() {
        return QueueBuilder.durable("analytics.leave-events").build();
    }
    @Bean Queue analyticsAttendanceQueue() {
        return QueueBuilder.durable("analytics.attendance-events").build();
    }

    @Bean Binding bindPayroll() {
        return BindingBuilder.bind(analyticsPayrollQueue())
                .to(payrollExchange()).with("payroll.*");
    }
    @Bean Binding bindEmployee() {
        return BindingBuilder.bind(analyticsEmployeeQueue())
                .to(employeeExchange()).with("employee.*");
    }
    @Bean Binding bindLeave() {
        return BindingBuilder.bind(analyticsLeaveQueue())
                .to(leaveExchange()).with("leave.*");
    }
    @Bean Binding bindAttendance() {
        return BindingBuilder.bind(analyticsAttendanceQueue())
                .to(attendanceExchange()).with("attendance.*");
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