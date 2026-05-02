package com.andikisha.auth.infrastructure.jwt;

import com.andikisha.auth.domain.model.User;
import com.andikisha.auth.infrastructure.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtTokenProvider {

    private final SecretKey key;

    @Getter
    private final long accessTokenExpirationMs;

    private final long refreshTokenExpirationMs;

    public JwtTokenProvider(JwtProperties jwtProperties) {
        byte[] keyBytes = decodeSecret(jwtProperties.secret());
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "JWT secret must be at least 256 bits (32 bytes) when Base64-decoded");
        }
        this.key = Keys.hmacShaKeyFor(keyBytes);
        this.accessTokenExpirationMs = jwtProperties.expirationMs();
        this.refreshTokenExpirationMs = jwtProperties.refreshExpirationMs();
    }

    private static byte[] decodeSecret(String secret) {
        // Normalise URL-safe Base64 (-_) → standard Base64 (+/) so both formats are accepted
        String normalised = secret.replace('-', '+').replace('_', '/');
        return java.util.Base64.getDecoder().decode(normalised);
    }

    public String generateAccessToken(User user, String planTier) {
        Instant now = Instant.now();
        var builder = Jwts.builder()
                .subject(user.getId().toString())
                .claim("tenantId", user.getTenantId())
                .claim("email", user.getEmail())
                .claim("role", user.getRole().name())
                .claim("employeeId",
                        user.getEmployeeId() != null ? user.getEmployeeId().toString() : null);
        if (planTier != null) {
            builder.claim("plan", planTier);
        }
        return builder
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(accessTokenExpirationMs)))
                .signWith(key)
                .compact();
    }

    public String generateRefreshToken(User user) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(user.getId().toString())
                .claim("tenantId", user.getTenantId())
                .claim("type", "refresh")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(refreshTokenExpirationMs)))
                .signWith(key)
                .compact();
    }

    public Instant getRefreshTokenExpiry() {
        return Instant.now().plusMillis(refreshTokenExpirationMs);
    }

    public Claims getClaims(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public UUID getUserIdFromToken(String token) {
        return UUID.fromString(getClaims(token).getSubject());
    }

    public String getTenantIdFromToken(String token) {
        return getClaims(token).get("tenantId", String.class);
    }

    public String generateUssdToken(String msisdn, String tenantId, String employeeId,
                                    long expirationMs) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(msisdn)
                .claim("tenantId", tenantId)
                .claim("employeeId", employeeId)
                .claim("role", "EMPLOYEE")
                .claim("sessionType", "USSD")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMs)))
                .signWith(key)
                .compact();
    }

    public String generateSuperAdminToken(String userId, long expirationMs) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userId)
                .claim("tenantId", "SYSTEM")
                .claim("role", "SUPER_ADMIN")
                .claim("sessionType", "SUPER_ADMIN")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMs)))
                .signWith(key)
                .compact();
    }

    public String generateSuperAdminRefreshToken(String userId, long expirationMs) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(userId)
                .claim("tenantId", "SYSTEM")
                .claim("role", "SUPER_ADMIN")
                .claim("type", "refresh")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMs)))
                .signWith(key)
                .compact();
    }

    public String generateImpersonationToken(String superAdminUserId, String targetTenantId,
                                             long expirationMs) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(superAdminUserId)
                .claim("tenantId", targetTenantId)
                .claim("role", "ADMIN")
                .claim("impersonatedBy", superAdminUserId)
                .claim("sessionType", "IMPERSONATION")
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(expirationMs)))
                .signWith(key)
                .compact();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parser().verifyWith(key).build().parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
