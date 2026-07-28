package com.andikisha.gateway.filter;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.http.HttpStatus;
import org.springframework.mock.http.server.reactive.MockServerHttpRequest;
import org.springframework.mock.web.server.MockServerWebExchange;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * InternalOnlyFilter rejects any request that does not carry X-Internal-Request: true.
 * The global JwtAuthenticationFilter strips that header from every inbound request, so a
 * route guarded by this filter is effectively unreachable through the gateway from outside —
 * used to keep the SUPER_ADMIN provisioning endpoint gateway-unreachable (SEC-BACKLOG-004).
 */
class InternalOnlyFilterTest {

    private InternalOnlyFilter filter;

    @BeforeEach
    void setUp() {
        filter = new InternalOnlyFilter();
    }

    private GatewayFilter gatewayFilter() {
        return filter.apply(new InternalOnlyFilter.Config());
    }

    @Test
    void missingInternalHeader_returnsForbidden() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v1/auth/super-admin/provision").build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(chain, never()).filter(any());
    }

    @Test
    void wrongInternalHeaderValue_returnsForbidden() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v1/auth/super-admin/provision")
                        .header("X-Internal-Request", "false")
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        assertThat(exchange.getResponse().getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
        verify(chain, never()).filter(any());
    }

    @Test
    void withInternalHeader_allowsThrough() {
        var exchange = MockServerWebExchange.from(
                MockServerHttpRequest.post("/api/v1/auth/super-admin/provision")
                        .header("X-Internal-Request", "true")
                        .build());
        GatewayFilterChain chain = mock(GatewayFilterChain.class);
        when(chain.filter(any())).thenReturn(Mono.empty());

        StepVerifier.create(gatewayFilter().filter(exchange, chain)).verifyComplete();

        verify(chain).filter(exchange);
    }
}
