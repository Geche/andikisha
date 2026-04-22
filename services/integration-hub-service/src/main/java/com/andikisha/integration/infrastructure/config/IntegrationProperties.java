package com.andikisha.integration.infrastructure.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app")
public record IntegrationProperties(
        Mpesa mpesa,
        BankTransfer bankTransfer,
        String credentialEncryptionKey
) {
    public record Mpesa(
            boolean enabled,
            String environment,
            String consumerKey,
            String consumerSecret
    ) {}

    public record BankTransfer(boolean enabled, String provider) {}
}
