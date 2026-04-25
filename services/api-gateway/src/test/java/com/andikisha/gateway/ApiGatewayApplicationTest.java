package com.andikisha.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(properties = {
        "spring.cloud.gateway.routes=",
        "spring.data.redis.host=localhost",
        "spring.data.redis.port=6379",
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration," +
                "org.springframework.boot.autoconfigure.data.redis.RedisReactiveAutoConfiguration"
})
@ActiveProfiles("test")
class ApiGatewayApplicationTest {

    @Test
    void contextLoads() {
    }
}
