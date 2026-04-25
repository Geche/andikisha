package com.andikisha.gateway.filter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class TenantValidationFilterTest {

    private TenantValidationFilter filter;

    @BeforeEach
    void setUp() {
        filter = new TenantValidationFilter();
    }

    // ── Protected paths ────────────────────────────────────────────────────────

    @Test
    void missingTenantIdHeader_returns400() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/employees").build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    @Test
    void presentTenantIdHeader_allowsThrough() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/employees")
                        .header("X-Tenant-ID", "tenant-123")
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(exchange)).thenReturn(Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isNull();
    }

    // ── Exact-path exemptions ──────────────────────────────────────────────────

    @Test
    void authLoginPath_bypassesTenantCheck() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v1/auth/login").build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(exchange)).thenReturn(Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isNull();
    }

    @Test
    void exactTenantsPath_bypassesTenantCheck() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v1/tenants").build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(exchange)).thenReturn(Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isNull();
    }

    @Test
    void authSubPath_requiresTenantHeader() {
        // /api/v1/auth/users is NOT in the exempt list — it is a tenant-scoped resource
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/api/v1/auth/users").build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST);
    }

    // ── Prefix-path exemptions ─────────────────────────────────────────────────

    @Test
    void actuatorHealthPath_bypassesTenantCheck() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/actuator/health").build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(exchange)).thenReturn(Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isNull();
    }

    @Test
    void swaggerUiPath_bypassesTenantCheck() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.get("/swagger-ui/index.html").build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(exchange)).thenReturn(Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isNull();
    }

    @Test
    void callbackPath_bypassesTenantCheck() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v1/callbacks/mpesa").build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(exchange)).thenReturn(Mono.empty());

        StepVerifier.create(filter.filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isNull();
    }
}
