package com.andikisha.tenant.application.service;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.tenant.domain.model.TenantSignatory;
import com.andikisha.tenant.domain.repository.TenantSignatoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.Set;

@Service
@Transactional(readOnly = true)
public class TenantSignatoryService {

    static final long MAX_BYTES = 512 * 1024; // 512 KB — a signature image is small.
    static final Set<String> ALLOWED_TYPES = Set.of("image/png", "image/jpeg");

    private final TenantSignatoryRepository repository;

    public TenantSignatoryService(TenantSignatoryRepository repository) {
        this.repository = repository;
    }

    /** Upload/replace the calling tenant's authorized signatory. Validates all fields. */
    @Transactional
    public void upload(String name, String title, byte[] signatureData, String contentType) {
        String tenantId = TenantContext.requireTenantId();
        if (name == null || name.isBlank()) {
            throw new BusinessRuleException("SIGNATORY_NAME_REQUIRED", "Signatory name is required");
        }
        if (title == null || title.isBlank()) {
            throw new BusinessRuleException("SIGNATORY_TITLE_REQUIRED", "Signatory title is required");
        }
        if (signatureData == null || signatureData.length == 0) {
            throw new BusinessRuleException("EMPTY_SIGNATURE", "Signature image is empty");
        }
        if (signatureData.length > MAX_BYTES) {
            throw new BusinessRuleException("SIGNATURE_TOO_LARGE",
                    "Signature image exceeds the " + (MAX_BYTES / 1024) + " KB limit");
        }
        String normalized = contentType == null ? "" : contentType.toLowerCase();
        if (!ALLOWED_TYPES.contains(normalized)) {
            throw new BusinessRuleException("UNSUPPORTED_SIGNATURE_TYPE",
                    "Signature image must be a PNG or JPEG");
        }
        String cleanName = name.trim();
        String cleanTitle = title.trim();
        TenantSignatory signatory = repository.findByTenantId(tenantId)
                .map(existing -> { existing.update(cleanName, cleanTitle, normalized, signatureData); return existing; })
                .orElseGet(() -> TenantSignatory.of(tenantId, cleanName, cleanTitle, normalized, signatureData));
        repository.save(signatory);
    }

    public Optional<TenantSignatory> getForCurrentTenant() {
        return repository.findByTenantId(TenantContext.requireTenantId());
    }

    /** For trusted internal callers (gRPC) that pass the tenant id explicitly. */
    public Optional<TenantSignatory> getForTenant(String tenantId) {
        return repository.findByTenantId(tenantId);
    }
}
