package com.andikisha.tenant.application.service;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.tenant.domain.model.TenantLogo;
import com.andikisha.tenant.domain.repository.TenantLogoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class TenantLogoService {

    static final long MAX_BYTES = 512 * 1024; // 512 KB — logos are small; keep the blob modest.
    static final Set<String> ALLOWED_TYPES = Set.of("image/png", "image/jpeg");

    private final TenantLogoRepository repository;

    public TenantLogoService(TenantLogoRepository repository) {
        this.repository = repository;
    }

    /** Upload/replace the calling tenant's logo. Validates type and size. */
    @Transactional
    public void upload(byte[] data, String contentType) {
        String tenantId = TenantContext.requireTenantId();
        if (data == null || data.length == 0) {
            throw new BusinessRuleException("EMPTY_LOGO", "Logo file is empty");
        }
        if (data.length > MAX_BYTES) {
            throw new BusinessRuleException("LOGO_TOO_LARGE",
                    "Logo exceeds the " + (MAX_BYTES / 1024) + " KB limit");
        }
        String normalized = contentType == null ? "" : contentType.toLowerCase();
        if (!ALLOWED_TYPES.contains(normalized)) {
            throw new BusinessRuleException("UNSUPPORTED_LOGO_TYPE",
                    "Logo must be a PNG or JPEG image");
        }
        TenantLogo logo = repository.findByTenantId(tenantId)
                .map(existing -> { existing.update(normalized, data); return existing; })
                .orElseGet(() -> TenantLogo.of(tenantId, normalized, data));
        repository.save(logo);
    }

    public Optional<TenantLogo> getForCurrentTenant() {
        return repository.findByTenantId(TenantContext.requireTenantId());
    }

    /** For trusted internal callers (gRPC) that pass the tenant id explicitly. */
    public Optional<TenantLogo> getForTenant(String tenantId) {
        return repository.findByTenantId(tenantId);
    }
}
