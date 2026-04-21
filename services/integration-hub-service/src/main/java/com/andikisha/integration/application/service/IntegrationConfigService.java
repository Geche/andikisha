package com.andikisha.integration.application.service;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.integration.application.dto.request.ConfigureIntegrationRequest;
import com.andikisha.integration.application.dto.response.IntegrationConfigResponse;
import com.andikisha.integration.domain.model.IntegrationConfig;
import com.andikisha.integration.domain.model.IntegrationType;
import com.andikisha.integration.domain.repository.IntegrationConfigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class IntegrationConfigService {

    private final IntegrationConfigRepository repository;

    public IntegrationConfigService(IntegrationConfigRepository repository) {
        this.repository = repository;
    }

    @Transactional
    public IntegrationConfigResponse configure(ConfigureIntegrationRequest request) {
        String tenantId = TenantContext.requireTenantId();
        IntegrationType type = IntegrationType.valueOf(request.integrationType().toUpperCase());
        String env = request.environment() != null && !request.environment().isBlank()
                ? request.environment() : "sandbox";

        IntegrationConfig config = repository
                .findByTenantIdAndIntegrationType(tenantId, type)
                .orElseGet(() -> IntegrationConfig.create(tenantId, type, env));

        config.configure(
                request.apiKey(), request.apiSecret(), request.shortcode(),
                request.initiatorName(), request.securityCredential(),
                request.callbackUrl(), request.timeoutUrl(), env
        );

        config = repository.save(config);
        return toResponse(config);
    }

    @Transactional
    public void activate(IntegrationType type) {
        String tenantId = TenantContext.requireTenantId();
        IntegrationConfig config = repository
                .findByTenantIdAndIntegrationType(tenantId, type)
                .orElseThrow(() -> new BusinessRuleException("CONFIG_NOT_FOUND",
                        "No configuration found for integration type: " + type));
        config.activate();
        repository.save(config);
    }

    public List<IntegrationConfigResponse> listConfigs() {
        String tenantId = TenantContext.requireTenantId();
        return repository.findByTenantId(tenantId).stream()
                .map(this::toResponse).toList();
    }

    private IntegrationConfigResponse toResponse(IntegrationConfig c) {
        return new IntegrationConfigResponse(
                c.getIntegrationType().name(),
                c.getShortcode(),
                c.getEnvironment(),
                c.isActive(),
                c.getApiKey() != null && !c.getApiKey().isBlank()
        );
    }
}
