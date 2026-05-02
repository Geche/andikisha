package com.andikisha.notification;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@ActiveProfiles("test")
class NotificationServiceApplicationTest {

    // Prevents CachingConnectionFactory from opening a TCP connection to localhost:5672.
    // With ConnectionFactory mocked, RabbitAutoConfiguration's @ConditionalOnMissingBean
    // is satisfied and all listener containers stay idle.
    @MockitoBean
    private ConnectionFactory connectionFactory;

    @MockitoBean
    private RabbitTemplate rabbitTemplate;

    @Test
    void contextLoads() {
    }
}
