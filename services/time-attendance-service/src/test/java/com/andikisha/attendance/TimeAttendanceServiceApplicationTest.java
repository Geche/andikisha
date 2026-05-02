package com.andikisha.attendance;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest(properties = {
        "grpc.server.port=-1",
        "spring.autoconfigure.exclude=" +
                "net.devh.boot.grpc.server.autoconfigure.GrpcServerAutoConfiguration," +
                "net.devh.boot.grpc.server.autoconfigure.GrpcServerFactoryAutoConfiguration," +
                "net.devh.boot.grpc.server.autoconfigure.GrpcServerMetricAutoConfiguration," +
                "net.devh.boot.grpc.client.autoconfigure.GrpcClientAutoConfiguration," +
                "net.devh.boot.grpc.client.autoconfigure.GrpcClientHealthAutoConfiguration",
        "spring.datasource.url=jdbc:h2:mem:attendance_test;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false",
        "spring.rabbitmq.host=localhost",
        "spring.rabbitmq.port=5672",
        "spring.rabbitmq.username=guest",
        "spring.rabbitmq.password=guest"
})
class TimeAttendanceServiceApplicationTest {

    // Prevents CachingConnectionFactory from opening a TCP connection to the broker.
    // Because ConnectionFactory is satisfied here, RabbitAutoConfiguration's own factory
    // is skipped (@ConditionalOnMissingBean) and all listener containers stay idle.
    @MockitoBean
    ConnectionFactory connectionFactory;

    @MockitoBean
    RabbitTemplate rabbitTemplate;

    @Test
    void contextLoads() {
    }
}
