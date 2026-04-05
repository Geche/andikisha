package com.andikisha.auth;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(properties = "grpc.server.port=-1")
@ActiveProfiles("test")
class AuthServiceApplicationTest {

    @Test
    void contextLoads() {
    }
}