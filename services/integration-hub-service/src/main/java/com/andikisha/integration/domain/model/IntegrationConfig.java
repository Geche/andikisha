package com.andikisha.integration.domain.model;

import com.andikisha.common.domain.BaseEntity;
import com.andikisha.integration.infrastructure.config.CredentialEncryptor;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;

@Getter
@Entity
@Table(name = "integration_configs",
        uniqueConstraints = @UniqueConstraint(
                columnNames = {"tenant_id", "integration_type"}))
public class IntegrationConfig extends BaseEntity {

    @Enumerated(EnumType.STRING)
    @Column(name = "integration_type", nullable = false, length = 30)
    private IntegrationType integrationType;

    @Convert(converter = CredentialEncryptor.class)
    @Column(name = "api_key", length = 500)
    private String apiKey;

    @Convert(converter = CredentialEncryptor.class)
    @Column(name = "api_secret", length = 500)
    private String apiSecret;

    @Column(name = "shortcode", length = 20)
    private String shortcode;

    @Column(name = "initiator_name", length = 100)
    private String initiatorName;

    @Convert(converter = CredentialEncryptor.class)
    @Column(name = "security_credential", length = 1000)
    private String securityCredential;

    @Column(name = "callback_url", length = 500)
    private String callbackUrl;

    @Column(name = "timeout_url", length = 500)
    private String timeoutUrl;

    @Column(name = "environment", nullable = false, length = 20)
    private String environment = "sandbox";

    @Column(name = "is_active", nullable = false)
    private boolean active = false;

    protected IntegrationConfig() {}

    public static IntegrationConfig create(String tenantId,
                                           IntegrationType type,
                                           String environment) {
        IntegrationConfig config = new IntegrationConfig();
        config.setTenantId(tenantId);
        config.integrationType = type;
        config.environment = environment;
        config.active = false;
        return config;
    }

    public void configure(String apiKey, String apiSecret, String shortcode,
                          String initiatorName, String securityCredential,
                          String callbackUrl, String timeoutUrl, String environment) {
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
        this.shortcode = shortcode;
        this.initiatorName = initiatorName;
        this.securityCredential = securityCredential;
        this.callbackUrl = callbackUrl;
        this.timeoutUrl = timeoutUrl;
        if (environment != null && !environment.isBlank()) {
            this.environment = environment;
        }
    }

    public void activate() { this.active = true; }
    public void deactivate() { this.active = false; }
}
