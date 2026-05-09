package com.andikisha.tenant.application.service;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

/**
 * Generates cryptographically random temporary passwords.
 * 20 base-62 characters give ~119 bits of entropy (log2(62^20)).
 */
@Component
public class PasswordGenerator {

    private static final String CHARSET =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    private static final int LENGTH = 20;
    private static final SecureRandom RANDOM = new SecureRandom();

    public String generate() {
        StringBuilder sb = new StringBuilder(LENGTH);
        for (int i = 0; i < LENGTH; i++) {
            sb.append(CHARSET.charAt(RANDOM.nextInt(CHARSET.length())));
        }
        return sb.toString();
    }
}
