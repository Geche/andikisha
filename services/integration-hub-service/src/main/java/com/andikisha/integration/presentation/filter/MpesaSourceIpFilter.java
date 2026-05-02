package com.andikisha.integration.presentation.filter;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.InetAddress;
import java.util.List;

@Component
public class MpesaSourceIpFilter implements Filter {

    private static final Logger log = LoggerFactory.getLogger(MpesaSourceIpFilter.class);
    private static final String CALLBACK_PREFIX = "/api/v1/callbacks/mpesa/";

    private final List<String> allowedCidrs;
    private final boolean disabled;

    /** Primary constructor used by Spring — reads config from application properties. */
    @org.springframework.beans.factory.annotation.Autowired
    public MpesaSourceIpFilter(
            @Value("${mpesa.callback.allowed-cidrs:196.201.214.0/24,196.201.216.0/23}") String cidrs,
            @Value("${mpesa.callback.ip-validation-disabled:false}") boolean disabled) {
        this.allowedCidrs = List.of(cidrs.split(","));
        this.disabled = disabled;
    }

    /** Secondary constructor for use in unit tests. */
    public MpesaSourceIpFilter(List<String> cidrs, boolean disabled) {
        this.allowedCidrs = cidrs;
        this.disabled = disabled;
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest  request  = (HttpServletRequest) req;
        HttpServletResponse response = (HttpServletResponse) res;
        String path = request.getRequestURI();

        if (!path.startsWith(CALLBACK_PREFIX) || disabled) {
            chain.doFilter(req, res);
            return;
        }

        String remoteIp = getClientIp(request);
        if (!isAllowed(remoteIp)) {
            log.warn("M-Pesa callback rejected from unauthorised IP: {} path={}", remoteIp, path);
            response.sendError(HttpServletResponse.SC_FORBIDDEN,
                    "Callback rejected: source IP not in Safaricom allowlist");
            return;
        }

        log.debug("M-Pesa callback accepted from IP: {} path={}", remoteIp, path);
        chain.doFilter(req, res);
    }

    private String getClientIp(HttpServletRequest request) {
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            return forwarded.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private boolean isAllowed(String ip) {
        for (String cidr : allowedCidrs) {
            if (ipMatchesCidr(ip, cidr)) return true;
        }
        return false;
    }

    private boolean ipMatchesCidr(String ip, String cidr) {
        try {
            String[] parts = cidr.split("/");
            InetAddress addr    = InetAddress.getByName(ip);
            InetAddress network = InetAddress.getByName(parts[0]);
            int prefix = Integer.parseInt(parts[1]);

            byte[] addrBytes    = addr.getAddress();
            byte[] networkBytes = network.getAddress();
            if (addrBytes.length != networkBytes.length) return false;

            int fullBytes = prefix / 8;
            int remainder = prefix % 8;
            for (int i = 0; i < fullBytes; i++) {
                if (addrBytes[i] != networkBytes[i]) return false;
            }
            if (remainder > 0) {
                int mask = (0xFF << (8 - remainder)) & 0xFF;
                if ((addrBytes[fullBytes] & mask) != (networkBytes[fullBytes] & mask)) return false;
            }
            return true;
        } catch (Exception e) {
            log.error("IP/CIDR check failed for ip={} cidr={}: {}", ip, cidr, e.getMessage());
            return false;
        }
    }
}
