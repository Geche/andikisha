package com.andikisha.integration.unit;

import com.andikisha.integration.presentation.filter.MpesaSourceIpFilter;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import jakarta.servlet.FilterChain;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class MpesaSourceIpFilterTest {

    private MpesaSourceIpFilter filter;
    private MockFilterChain chain;

    @BeforeEach
    void setUp() {
        filter = new MpesaSourceIpFilter(
                List.of("196.201.214.0/24", "196.201.216.0/23"),
                false);
        chain = new MockFilterChain();
    }

    @Test
    void filter_safaricomIp_passes() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/callbacks/mpesa/b2c/result");
        request.setRemoteAddr("196.201.214.50");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isNotEqualTo(403);
        assertThat(chain.getRequest()).isNotNull();
    }

    @Test
    void filter_unknownIp_returns403() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/callbacks/mpesa/b2c/result");
        request.setRemoteAddr("1.2.3.4");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain mockChain = mock(FilterChain.class);

        filter.doFilter(request, response, mockChain);

        assertThat(response.getStatus()).isEqualTo(403);
        verify(mockChain, never()).doFilter(any(), any());
    }

    @Test
    void filter_nonCallbackPath_passes() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/payments");
        request.setRemoteAddr("1.2.3.4");
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, chain);

        assertThat(response.getStatus()).isNotEqualTo(403);
    }
}
