package com.andikisha.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "spring.cloud.gateway.routes=",
                "spring.main.web-application-type=reactive",
                "spring.data.redis.host=localhost",
                "spring.data.redis.port=6379",
                "spring.autoconfigure.exclude=" +
                        "org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration," +
                        "org.springframework.boot.autoconfigure.data.redis.RedisReactiveAutoConfiguration," +
                        "org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration"
        })
@ActiveProfiles("test")
class ApiGatewayApplicationTest {

    @MockBean
    ReactiveStringRedisTemplate reactiveStringRedisTemplate;

    @MockBean
    RedisRateLimiter planAwareRateLimiter;

    @Test
    void contextLoads() {
    }
}
