package com.andikisha.tenant.unit;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.tenant.application.dto.response.FeatureFlagResponse;
import com.andikisha.tenant.application.mapper.TenantMapper;
import com.andikisha.tenant.application.service.FeatureFlagService;
import com.andikisha.tenant.domain.model.FeatureFlag;
import com.andikisha.tenant.domain.repository.FeatureFlagRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class FeatureFlagServiceTest {

    private static final String TENANT_ID = "tenant-abc";
    private static final String FEATURE_KEY = "payroll_module";

    @Mock private FeatureFlagRepository repository;
    @Mock private TenantMapper mapper;

    @InjectMocks private FeatureFlagService featureFlagService;

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void getAllForTenant_returnsMappedFlags() {
        FeatureFlag flag = FeatureFlag.create(TENANT_ID, FEATURE_KEY, true, "Payroll");
        when(repository.findByTenantId(TENANT_ID)).thenReturn(List.of(flag));
        when(mapper.toResponse(flag)).thenReturn(new FeatureFlagResponse(FEATURE_KEY, true, "Payroll"));

        List<FeatureFlagResponse> result = featureFlagService.getAllForTenant();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).featureKey()).isEqualTo(FEATURE_KEY);
        assertThat(result.get(0).enabled()).isTrue();
    }

    @Test
    void enable_whenFlagExists_enablesIt() {
        FeatureFlag flag = FeatureFlag.create(TENANT_ID, FEATURE_KEY, false, null);
        when(repository.findByTenantIdAndFeatureKey(TENANT_ID, FEATURE_KEY))
                .thenReturn(Optional.of(flag));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toResponse(any(FeatureFlag.class))).thenAnswer(inv -> {
            FeatureFlag f = inv.getArgument(0);
            return new FeatureFlagResponse(f.getFeatureKey(), f.isEnabled(), f.getDescription());
        });

        FeatureFlagResponse result = featureFlagService.enable(FEATURE_KEY);

        assertThat(result.enabled()).isTrue();
        verify(repository).save(flag);
    }

    @Test
    void enable_whenFlagAlreadyEnabled_remainsEnabled() {
        FeatureFlag flag = FeatureFlag.create(TENANT_ID, FEATURE_KEY, true, null);
        when(repository.findByTenantIdAndFeatureKey(TENANT_ID, FEATURE_KEY))
                .thenReturn(Optional.of(flag));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toResponse(any(FeatureFlag.class))).thenAnswer(inv -> {
            FeatureFlag f = inv.getArgument(0);
            return new FeatureFlagResponse(f.getFeatureKey(), f.isEnabled(), f.getDescription());
        });

        FeatureFlagResponse result = featureFlagService.enable(FEATURE_KEY);

        assertThat(result.enabled()).isTrue();
    }

    @Test
    void disable_whenFlagExists_disablesIt() {
        FeatureFlag flag = FeatureFlag.create(TENANT_ID, FEATURE_KEY, true, null);
        when(repository.findByTenantIdAndFeatureKey(TENANT_ID, FEATURE_KEY))
                .thenReturn(Optional.of(flag));
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toResponse(any(FeatureFlag.class))).thenAnswer(inv -> {
            FeatureFlag f = inv.getArgument(0);
            return new FeatureFlagResponse(f.getFeatureKey(), f.isEnabled(), f.getDescription());
        });

        FeatureFlagResponse result = featureFlagService.disable(FEATURE_KEY);

        assertThat(result.enabled()).isFalse();
    }

    @Test
    void enable_whenFlagDoesNotExist_createsAndEnablesIt() {
        when(repository.findByTenantIdAndFeatureKey(TENANT_ID, FEATURE_KEY))
                .thenReturn(Optional.empty());
        when(repository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toResponse(any(FeatureFlag.class))).thenAnswer(inv -> {
            FeatureFlag f = inv.getArgument(0);
            return new FeatureFlagResponse(f.getFeatureKey(), f.isEnabled(), f.getDescription());
        });

        FeatureFlagResponse result = featureFlagService.enable(FEATURE_KEY);

        assertThat(result.featureKey()).isEqualTo(FEATURE_KEY);
        assertThat(result.enabled()).isTrue();
    }

    @Test
    void isEnabled_whenFlagEnabledForTenant_returnsTrue() {
        when(repository.existsByTenantIdAndFeatureKeyAndEnabledTrue(TENANT_ID, FEATURE_KEY))
                .thenReturn(true);

        assertThat(featureFlagService.isEnabled(FEATURE_KEY)).isTrue();
    }

    @Test
    void isEnabled_whenFlagNotEnabledForTenant_returnsFalse() {
        when(repository.existsByTenantIdAndFeatureKeyAndEnabledTrue(TENANT_ID, FEATURE_KEY))
                .thenReturn(false);

        assertThat(featureFlagService.isEnabled(FEATURE_KEY)).isFalse();
    }
}
