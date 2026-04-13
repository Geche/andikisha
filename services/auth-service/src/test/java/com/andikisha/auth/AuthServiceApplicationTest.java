package com.andikisha.auth;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(properties = "grpc.server.port=-1")
@ActiveProfiles("test")
class AuthServiceApplicationTest {

    // Prevent Spring from connecting to a real RabbitMQ broker during the context load test
    @MockitoBean
    ConnectionFactory connectionFactory;

    @Test
    void contextLoads() {
    }
}