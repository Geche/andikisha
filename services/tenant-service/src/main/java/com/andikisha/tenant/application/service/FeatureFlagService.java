package com.andikisha.tenant.application.service;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.tenant.application.dto.response.FeatureFlagResponse;
import com.andikisha.tenant.application.mapper.TenantMapper;
import com.andikisha.tenant.domain.model.FeatureFlag;
import com.andikisha.tenant.domain.repository.FeatureFlagRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class FeatureFlagService {

    private final FeatureFlagRepository repository;
    private final TenantMapper mapper;

    public FeatureFlagService(FeatureFlagRepository repository, TenantMapper mapper) {
        this.repository = repository;
        this.mapper = mapper;
    }

    public List<FeatureFlagResponse> getAllForTenant() {
        String tenantId = TenantContext.requireTenantId();
        return repository.findByTenantId(tenantId).stream()
                .map(mapper::toResponse).toList();
    }

    public boolean isEnabled(String featureKey) {
        String tenantId = TenantContext.requireTenantId();
        return repository.existsByTenantIdAndFeatureKeyAndEnabledTrue(tenantId, featureKey);
    }

    @Transactional
    public FeatureFlagResponse enable(String featureKey) {
        String tenantId = TenantContext.requireTenantId();
        FeatureFlag flag = repository.findByTenantIdAndFeatureKey(tenantId, featureKey)
                .orElseGet(() -> FeatureFlag.create(tenantId, featureKey, false, null));
        flag.enable();
        return mapper.toResponse(repository.save(flag));
    }

    @Transactional
    public FeatureFlagResponse disable(String featureKey) {
        String tenantId = TenantContext.requireTenantId();
        FeatureFlag flag = repository.findByTenantIdAndFeatureKey(tenantId, featureKey)
                .orElseGet(() -> FeatureFlag.create(tenantId, featureKey, false, null));
        flag.disable();
        return mapper.toResponse(repository.save(flag));
    }
}