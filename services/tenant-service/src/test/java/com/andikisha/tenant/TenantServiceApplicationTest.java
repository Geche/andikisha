package com.andikisha.tenant;

import org.junit.jupiter.api.Test;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.connection.ReactiveRedisConnectionFactory;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@ActiveProfiles("test")
class TenantServiceApplicationTest {

    // Prevent actual RabbitMQ connection during context load test
    @MockitoBean
    private ConnectionFactory connectionFactory;
    @MockitoBean
    private RabbitTemplate rabbitTemplate;

    // Prevent actual Redis connection during context load test
    @MockitoBean
    private RedisConnectionFactory redisConnectionFactory;
    @MockitoBean
    private ReactiveRedisConnectionFactory reactiveRedisConnectionFactory;
    @MockitoBean
    private StringRedisTemplate stringRedisTemplate;

    // Prevent gRPC client from attempting to connect to auth-service during context load
    @MockitoBean
    private com.andikisha.tenant.infrastructure.grpc.AuthServiceGrpcClient authServiceGrpcClient;

    @Test
    void contextLoads() {
    }
}