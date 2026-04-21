package com.andikisha.integration.infrastructure.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

/**
 * Transparently encrypts/decrypts API credentials at rest using AES-256-GCM.
 * The key is loaded from the CREDENTIAL_ENCRYPTION_KEY environment variable (32 bytes, Base64).
 * If the key is absent (local dev), values are stored unencrypted with a warning.
 */
@Converter
@Component
public class CredentialEncryptor implements AttributeConverter<String, String> {

    private static final Logger log = LoggerFactory.getLogger(CredentialEncryptor.class);
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 128;

    private final byte[] keyBytes;

    public CredentialEncryptor(
            @Value("${app.credential-encryption-key:}") String base64Key) {
        if (base64Key == null || base64Key.isBlank()) {
            log.warn("CREDENTIAL_ENCRYPTION_KEY not set — credentials stored unencrypted. " +
                     "Set app.credential-encryption-key in production.");
            this.keyBytes = null;
        } else {
            this.keyBytes = Base64.getDecoder().decode(base64Key);
        }
    }

    @Override
    public String convertToDatabaseColumn(String plaintext) {
        if (plaintext == null || keyBytes == null) return plaintext;
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            new SecureRandom().nextBytes(iv);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE,
                    new SecretKeySpec(keyBytes, "AES"),
                    new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            byte[] encrypted = cipher.doFinal(plaintext.getBytes());
            byte[] combined = new byte[iv.length + encrypted.length];
            System.arraycopy(iv, 0, combined, 0, iv.length);
            System.arraycopy(encrypted, 0, combined, iv.length, encrypted.length);
            return Base64.getEncoder().encodeToString(combined);
        } catch (Exception e) {
            throw new IllegalStateException("Failed to encrypt credential", e);
        }
    }

    @Override
    public String convertToEntityAttribute(String ciphertext) {
        if (ciphertext == null || keyBytes == null) return ciphertext;
        try {
            byte[] combined = Base64.getDecoder().decode(ciphertext);
            byte[] iv = new byte[GCM_IV_LENGTH];
            System.arraycopy(combined, 0, iv, 0, GCM_IV_LENGTH);
            byte[] encrypted = new byte[combined.length - GCM_IV_LENGTH];
            System.arraycopy(combined, GCM_IV_LENGTH, encrypted, 0, encrypted.length);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE,
                    new SecretKeySpec(keyBytes, "AES"),
                    new GCMParameterSpec(GCM_TAG_LENGTH, iv));
            return new String(cipher.doFinal(encrypted));
        } catch (Exception e) {
            throw new IllegalStateException("Failed to decrypt credential", e);
        }
    }
}
