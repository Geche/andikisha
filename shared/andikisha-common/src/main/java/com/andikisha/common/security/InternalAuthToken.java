package com.andikisha.common.security;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Base64;

/**
 * Gateway-signed internal attestation of the identity headers the gateway injects (audit M1/M2).
 *
 * <p>The gateway, after authenticating the JWT, signs the exact identity it injects
 * ({@code X-User-ID / X-Tenant-ID / X-User-Role / X-User-Email / X-Employee-ID}) and adds the result
 * as {@code X-Internal-Auth}. Each service verifies the token against the identity headers it
 * received before trusting them, so {@code X-User-Role: ADMIN} (and the tenant) are honoured only
 * when they provably came from the gateway — closing the trusted-header spoofing the audit found.
 *
 * <p>Token format: {@code base64url(HMAC-SHA256(secret, canonical))} {@code "." issuedAtEpochSec},
 * where {@code canonical} binds every identity field (newline-delimited — newlines are illegal in
 * HTTP header values, so the delimiter cannot be injected) plus the issue time. The issue time is
 * verified within a small skew window to bound replay. All comparisons are constant-time.
 *
 * <p>Uses a dedicated {@code INTERNAL_SIGNING_SECRET}, distinct from the JWT secret, so a compromise
 * of one does not grant the other.
 */
public final class InternalAuthToken {

    private static final String HMAC_ALGO = "HmacSHA256";

    private final SecretKeySpec key;
    private final long maxSkewSeconds;

    public InternalAuthToken(byte[] secret, long maxSkewSeconds) {
        if (secret == null || secret.length < 16) {
            throw new IllegalArgumentException("Internal auth secret must be at least 16 bytes");
        }
        if (maxSkewSeconds < 0) {
            throw new IllegalArgumentException("maxSkewSeconds must not be negative");
        }
        this.key = new SecretKeySpec(secret, HMAC_ALGO);
        this.maxSkewSeconds = maxSkewSeconds;
    }

    /** Produce the {@code X-Internal-Auth} value binding {@code identity} and {@code issuedAtEpochSec}. */
    public String sign(long issuedAtEpochSec, String... identity) {
        String mac = base64Url(hmac(canonical(identity, issuedAtEpochSec)));
        return mac + "." + issuedAtEpochSec;
    }

    /**
     * True iff {@code token} is a valid, unexpired attestation of exactly {@code identity}.
     * {@code nowEpochSec} is the verifying service's clock (passed in for testability).
     */
    public boolean verify(String token, long nowEpochSec, String... identity) {
        if (token == null) {
            return false;
        }
        int dot = token.lastIndexOf('.');
        if (dot <= 0 || dot == token.length() - 1) {
            return false;
        }
        long issuedAt;
        try {
            issuedAt = Long.parseLong(token.substring(dot + 1));
        } catch (NumberFormatException e) {
            return false;
        }
        long age = nowEpochSec - issuedAt;
        if (age > maxSkewSeconds || age < -maxSkewSeconds) {
            return false; // expired or implausibly future-dated
        }
        byte[] presented = base64UrlDecode(token.substring(0, dot));
        if (presented == null) {
            return false;
        }
        byte[] expected = hmac(canonical(identity, issuedAt));
        return MessageDigest.isEqual(expected, presented);
    }

    private byte[] hmac(String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGO);
            mac.init(key);
            return mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException("HMAC computation failed", e);
        }
    }

    private static String canonical(String[] identity, long issuedAt) {
        StringBuilder sb = new StringBuilder();
        for (String value : identity) {
            sb.append(value == null ? "" : value).append('\n');
        }
        return sb.append(issuedAt).toString();
    }

    private static String base64Url(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static byte[] base64UrlDecode(String s) {
        try {
            return Base64.getUrlDecoder().decode(s);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
