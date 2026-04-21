package com.andikisha.integration.unit;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.integration.application.dto.request.ConfigureIntegrationRequest;
import com.andikisha.integration.application.dto.response.IntegrationConfigResponse;
import com.andikisha.integration.application.service.IntegrationConfigService;
import com.andikisha.integration.domain.model.IntegrationConfig;
import com.andikisha.integration.domain.model.IntegrationType;
import com.andikisha.integration.domain.repository.IntegrationConfigRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class IntegrationConfigServiceTest {

    private static final String TENANT_ID = "tenant-config-test";

    @Mock IntegrationConfigRepository repository;

    private IntegrationConfigService service;

    @BeforeEach
    void setUp() {
        service = new IntegrationConfigService(repository);
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    // -------------------------------------------------------------------------
    // configure
    // -------------------------------------------------------------------------

    @Test
    void configure_createsNewConfigWhenNoneExists() {
        when(repository.findByTenantIdAndIntegrationType(TENANT_ID, IntegrationType.MPESA_B2C))
                .thenReturn(Optional.empty());
        when(repository.save(any(IntegrationConfig.class)))
                .thenAnswer(i -> i.getArgument(0));

        IntegrationConfigResponse response = service.configure(buildRequest("sandbox"));

        assertThat(response.integrationType()).isEqualTo("MPESA_B2C");
        assertThat(response.environment()).isEqualTo("sandbox");
        assertThat(response.active()).isFalse();
        assertThat(response.configured()).isTrue();
    }

    @Test
    void configure_updatesExistingConfigInsteadOfCreatingDuplicate() {
        IntegrationConfig existing = IntegrationConfig.create(
                TENANT_ID, IntegrationType.MPESA_B2C, "sandbox");
        when(repository.findByTenantIdAndIntegrationType(TENANT_ID, IntegrationType.MPESA_B2C))
                .thenReturn(Optional.of(existing));
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        service.configure(buildRequest("production"));

        assertThat(existing.getEnvironment()).isEqualTo("production");
        verify(repository).save(existing);
    }

    @Test
    void configure_defaultsToSandboxWhenEnvironmentBlank() {
        when(repository.findByTenantIdAndIntegrationType(TENANT_ID, IntegrationType.MPESA_B2C))
                .thenReturn(Optional.empty());
        when(repository.save(any())).thenAnswer(i -> i.getArgument(0));

        ConfigureIntegrationRequest request = new ConfigureIntegrationRequest(
                "MPESA_B2C", "key", "secret", "600100",
                "TestInitiator", "credential",
                "https://callback.example.com", "https://timeout.example.com",
                "   ");

        IntegrationConfigResponse response = service.configure(request);

        assertThat(response.environment()).isEqualTo("sandbox");
    }

    // -------------------------------------------------------------------------
    // activate
    // -------------------------------------------------------------------------

    @Test
    void activate_happyPath_setsActiveTrue() {
        IntegrationConfig config = IntegrationConfig.create(
                TENANT_ID, IntegrationType.MPESA_B2C, "sandbox");
        when(repository.findByTenantIdAndIntegrationType(TENANT_ID, IntegrationType.MPESA_B2C))
                .thenReturn(Optional.of(config));

        service.activate(IntegrationType.MPESA_B2C);

        assertThat(config.isActive()).isTrue();
        verify(repository).save(config);
    }

    @Test
    void activate_whenConfigNotFound_throwsBusinessRuleException() {
        when(repository.findByTenantIdAndIntegrationType(TENANT_ID, IntegrationType.MPESA_B2C))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.activate(IntegrationType.MPESA_B2C))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("No configuration found");
    }

    // -------------------------------------------------------------------------
    // listConfigs
    // -------------------------------------------------------------------------

    @Test
    void listConfigs_returnsOnlyTenantConfigs() {
        IntegrationConfig mpesa = IntegrationConfig.create(
                TENANT_ID, IntegrationType.MPESA_B2C, "sandbox");
        IntegrationConfig nssf = IntegrationConfig.create(
                TENANT_ID, IntegrationType.NSSF_REMITTANCE, "production");
        when(repository.findByTenantId(TENANT_ID)).thenReturn(List.of(mpesa, nssf));

        List<IntegrationConfigResponse> configs = service.listConfigs();

        assertThat(configs).hasSize(2);
        assertThat(configs).extracting(IntegrationConfigResponse::integrationType)
                .containsExactlyInAnyOrder("MPESA_B2C", "NSSF_REMITTANCE");
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private ConfigureIntegrationRequest buildRequest(String environment) {
        return new ConfigureIntegrationRequest(
                "MPESA_B2C",
                "test-api-key", "test-api-secret",
                "600100", "TestInitiator", "encrypted-credential",
                "https://callback.example.com", "https://timeout.example.com",
                environment);
    }
}
