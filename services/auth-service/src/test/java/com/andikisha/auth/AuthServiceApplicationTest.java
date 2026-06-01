package com.andikisha.auth;

import com.andikisha.auth.infrastructure.grpc.EmployeeGrpcClient;
import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(properties = {
        "grpc.server.port=-1",
        "spring.autoconfigure.exclude=" +
                "net.devh.boot.grpc.client.autoconfigure.GrpcClientAutoConfiguration," +
                "net.devh.boot.grpc.client.autoconfigure.GrpcClientHealthAutoConfiguration"
})
@ActiveProfiles("test")
class AuthServiceApplicationTest {

    // Prevent Spring from connecting to a real RabbitMQ broker during the context load test
    @MockitoBean
    ConnectionFactory connectionFactory;

    // GrpcClientAutoConfiguration is excluded above — mock the client bean directly
    @MockitoBean
    EmployeeGrpcClient employeeGrpcClient;

    @Test
    void contextLoads() {
    }
}