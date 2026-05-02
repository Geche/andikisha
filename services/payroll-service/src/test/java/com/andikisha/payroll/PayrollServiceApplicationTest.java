package com.andikisha.payroll;

import com.andikisha.payroll.infrastructure.grpc.EmployeeGrpcClient;
import com.andikisha.payroll.infrastructure.grpc.LeaveGrpcClient;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(properties = {
        "grpc.server.port=-1",
        // GrpcClientBeanPostProcessor eagerly creates channels for @GrpcClient-annotated beans
        // (even mocked ones) and fails on the missing InternalGlobalInterceptors shaded class.
        // Excluding both client auto-configurations lets the context load cleanly:
        //   GrpcClientAutoConfiguration      — registers GrpcClientBeanPostProcessor & GrpcChannelFactory
        //   GrpcClientHealthAutoConfiguration — registers grpcChannelHealthIndicator (needs GrpcChannelFactory)
        "spring.autoconfigure.exclude=" +
                "net.devh.boot.grpc.client.autoconfigure.GrpcClientAutoConfiguration," +
                "net.devh.boot.grpc.client.autoconfigure.GrpcClientHealthAutoConfiguration"
})
@ActiveProfiles("test")
class PayrollServiceApplicationTest {

    // Prevents CachingConnectionFactory from opening a TCP connection to the broker.
    // Because ConnectionFactory is satisfied here, RabbitAutoConfiguration's own factory
    // is skipped (@ConditionalOnMissingBean) and all listener containers stay idle.
    @MockitoBean
    private ConnectionFactory connectionFactory;

    // Prevents RabbitMQ auto-configuration from attempting a real broker connection
    @MockitoBean
    private RabbitTemplate rabbitTemplate;

    // Prevents grpc-spring-boot-starter from trying to connect to employee-service on startup
    @MockitoBean
    private EmployeeGrpcClient employeeGrpcClient;

    // Prevents grpc-spring-boot-starter from trying to connect to leave-service on startup
    @MockitoBean
    private LeaveGrpcClient leaveGrpcClient;

    @Test
    void contextLoads() {
    }
}
