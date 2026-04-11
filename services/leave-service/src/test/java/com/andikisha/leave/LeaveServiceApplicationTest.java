package com.andikisha.leave;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@ActiveProfiles("test")
class LeaveServiceApplicationTest {

    // MockitoBean ConnectionFactory prevents CachingConnectionFactory from
    // opening a TCP connection to localhost:5672. Because ConnectionFactory is
    // already satisfied, RabbitAutoConfiguration's own factory is skipped
    // (@ConditionalOnMissingBean). RabbitMqConfig.rabbitTemplate() then receives
    // this mock, so RabbitTemplate is also safe without a real broker.
    @MockitoBean
    private ConnectionFactory connectionFactory;

    @MockitoBean
    private RabbitTemplate rabbitTemplate;

    @Test
    void contextLoads() {
    }
}
