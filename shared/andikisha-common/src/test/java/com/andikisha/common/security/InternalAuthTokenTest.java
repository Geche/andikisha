package com.andikisha.common.security;

import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Gateway-signed internal attestation (audit M1/M2): the gateway signs the identity it injects, and
 * each service verifies before trusting X-User-Role etc., so they are honoured only when they
 * provably came from the gateway.
 */
class InternalAuthTokenTest {

    private static final byte[] SECRET = "0123456789abcdef0123456789abcdef".getBytes(StandardCharsets.UTF_8); // gitleaks:allow — non-secret HMAC test fixture
    private static final long SKEW = 30;
    private final InternalAuthToken token = new InternalAuthToken(SECRET, SKEW);

    // gateway-injected identity: userId, tenantId, role, email, employeeId
    private static final String[] IDENTITY = {"user-1", "tenant-1", "ADMIN", "a@b.com", "emp-1"};

    @Test
    void signedToken_verifiesWithSameIdentityWithinSkew() {
        String tok = token.sign(1000, IDENTITY);
        assertThat(token.verify(tok, 1000, IDENTITY)).isTrue();
        assertThat(token.verify(tok, 1020, IDENTITY)).isTrue();     // +20s, within skew
        assertThat(token.verify(tok, 980, IDENTITY)).isTrue();      // -20s, within skew
    }

    @Test
    void tamperedRole_failsVerification() {
        String tok = token.sign(1000, IDENTITY);
        String[] escalated = {"user-1", "tenant-1", "SUPER_ADMIN", "a@b.com", "emp-1"};
        assertThat(token.verify(tok, 1000, escalated)).isFalse();
    }

    @Test
    void tamperedTenant_failsVerification() {
        String tok = token.sign(1000, IDENTITY);
        String[] victimTenant = {"user-1", "victim-tenant", "ADMIN", "a@b.com", "emp-1"};
        assertThat(token.verify(tok, 1000, victimTenant)).isFalse();
    }

    @Test
    void tamperedMac_failsVerification() {
        String tok = token.sign(1000, IDENTITY);
        char c = tok.charAt(0);
        String flipped = (c == 'A' ? 'B' : 'A') + tok.substring(1);
        assertThat(token.verify(flipped, 1000, IDENTITY)).isFalse();
    }

    @Test
    void expiredToken_failsVerification() {
        String tok = token.sign(1000, IDENTITY);
        assertThat(token.verify(tok, 1000 + SKEW + 1, IDENTITY)).isFalse();
    }

    @Test
    void futureDatedToken_failsVerification() {
        String tok = token.sign(1000, IDENTITY);
        assertThat(token.verify(tok, 1000 - SKEW - 1, IDENTITY)).isFalse();
    }

    @Test
    void malformedToken_failsVerification() {
        assertThat(token.verify(null, 1000, IDENTITY)).isFalse();
        assertThat(token.verify("", 1000, IDENTITY)).isFalse();
        assertThat(token.verify("nodot", 1000, IDENTITY)).isFalse();
        assertThat(token.verify("mac.notanumber", 1000, IDENTITY)).isFalse();
        assertThat(token.verify("!!!.1000", 1000, IDENTITY)).isFalse(); // invalid base64url mac
    }

    @Test
    void differentSecret_failsVerification() {
        String tok = token.sign(1000, IDENTITY);
        InternalAuthToken other = new InternalAuthToken(
                "ffffffffffffffffffffffffffffffff".getBytes(StandardCharsets.UTF_8), SKEW);
        assertThat(other.verify(tok, 1000, IDENTITY)).isFalse();
    }

    @Test
    void emptyIdentityFields_areBoundConsistently() {
        String[] withEmpties = {"user-1", "tenant-1", "EMPLOYEE", "", ""}; // no email / employeeId
        String tok = token.sign(1000, withEmpties);
        assertThat(token.verify(tok, 1000, withEmpties)).isTrue();
        // an attacker who fills in the empty employeeId must not verify
        String[] filledEmployee = {"user-1", "tenant-1", "EMPLOYEE", "", "emp-999"};
        assertThat(token.verify(tok, 1000, filledEmployee)).isFalse();
    }

    @Test
    void rejectsTooShortSecret() {
        assertThatThrownBy(() -> new InternalAuthToken("short".getBytes(StandardCharsets.UTF_8), SKEW))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
