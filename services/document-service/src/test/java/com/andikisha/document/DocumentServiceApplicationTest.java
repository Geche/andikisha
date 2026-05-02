package com.andikisha.document;

import com.andikisha.document.infrastructure.grpc.PayrollGrpcClient;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(properties = {
        "grpc.server.port=-1",
        // GrpcClientBeanPostProcessor eagerly creates channels for @GrpcClient-annotated beans
        // and fails on missing InternalGlobalInterceptors shaded class without a real broker.
        // Excluding both client auto-configurations lets the context load cleanly.
        "spring.autoconfigure.exclude=" +
                "net.devh.boot.grpc.client.autoconfigure.GrpcClientAutoConfiguration," +
                "net.devh.boot.grpc.client.autoconfigure.GrpcClientHealthAutoConfiguration"
})
@ActiveProfiles("test")
class DocumentServiceApplicationTest {

    // Prevents CachingConnectionFactory from opening a TCP connection to localhost:5672.
    // With ConnectionFactory mocked, RabbitAutoConfiguration's @ConditionalOnMissingBean
    // is satisfied and all listener containers stay idle.
    @MockitoBean
    private ConnectionFactory connectionFactory;

    @MockitoBean
    private RabbitTemplate rabbitTemplate;

    // Prevents grpc-spring-boot-starter from trying to connect to payroll-service on startup
    @MockitoBean
    private PayrollGrpcClient payrollGrpcClient;

    @Test
    void contextLoads() {
    }
}
