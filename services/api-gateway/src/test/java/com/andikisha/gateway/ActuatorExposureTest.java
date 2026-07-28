package com.andikisha.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.reactive.AutoConfigureWebTestClient;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cloud.gateway.filter.ratelimit.RedisRateLimiter;
import org.springframework.data.redis.core.ReactiveStringRedisTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.reactive.server.WebTestClient;

/**
 * The API gateway shares its actuator with the internet-facing app port (no management.server.port),
 * and the JWT enforcement is a Gateway GlobalFilter that never runs for /actuator/** paths. So any
 * actuator endpoint left in the web exposure list is reachable unauthenticated on the public port.
 *
 * <p>The Spring Cloud Gateway {@code gateway} actuator endpoint discloses the full internal route
 * table (every backend URI/port and filter chain) and registers mutating operations (add/refresh/
 * delete route) — reconnaissance plus route-swap SSRF / route-deletion DoS. {@code metrics} leaks
 * operational data. Neither may be exposed on the public port. {@code health}/{@code info} must
 * remain (Docker readiness probes depend on them). See docs/security/security-audit-2026-07-28.md H1.
 */
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
@AutoConfigureWebTestClient
class ActuatorExposureTest {

    @MockBean
    ReactiveStringRedisTemplate reactiveStringRedisTemplate;

    @MockBean
    RedisRateLimiter planAwareRateLimiter;

    @Autowired
    WebTestClient webTestClient;

    @Test
    void gatewayRoutesEndpoint_isNotExposed() {
        webTestClient.get().uri("/actuator/gateway/routes")
                .exchange()
                .expectStatus().isNotFound();
    }

    @Test
    void metricsEndpoint_isNotExposed() {
        webTestClient.get().uri("/actuator/metrics")
                .exchange()
                .expectStatus().isNotFound();
    }

    @Test
    void healthEndpoint_remainsAvailable() {
        webTestClient.get().uri("/actuator/health")
                .exchange()
                .expectStatus().isOk();
    }
}
