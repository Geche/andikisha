package com.andikisha.integration;

import com.andikisha.integration.infrastructure.messaging.PaymentProcessor;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(properties = {
        "grpc.server.port=-1",
        "spring.autoconfigure.exclude=" +
                "net.devh.boot.grpc.client.autoconfigure.GrpcClientAutoConfiguration," +
                "net.devh.boot.grpc.client.autoconfigure.GrpcClientHealthAutoConfiguration",
        "spring.datasource.url=jdbc:h2:mem:integration_test;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false",
        "app.credential-encryption-key=",
        "spring.rabbitmq.host=localhost",
        "spring.rabbitmq.port=5672",
        "spring.rabbitmq.username=guest",
        "spring.rabbitmq.password=guest",
        "spring.data.redis.host=localhost",
        "spring.data.redis.port=6379",
        "app.mpesa.consumer-key=test-key",
        "app.mpesa.consumer-secret=test-secret",
        "mpesa.callback.ip-validation-disabled=true"
})
class IntegrationHubServiceApplicationTest {

    @MockitoBean RabbitTemplate rabbitTemplate;
    @MockitoBean StringRedisTemplate stringRedisTemplate;
    @MockitoBean PaymentProcessor paymentProcessor;
    @MockitoBean
    ConnectionFactory connectionFactory;

    @Test
    void contextLoads() {
    }
}
