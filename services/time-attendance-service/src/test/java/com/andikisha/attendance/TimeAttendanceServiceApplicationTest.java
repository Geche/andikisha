package com.andikisha.attendance;

import org.junit.jupiter.api.Test;
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
        "spring.flyway.enabled=false"
})
class TimeAttendanceServiceApplicationTest {

    @MockitoBean
    RabbitTemplate rabbitTemplate;

    @Test
    void contextLoads() {
    }
}
