package com.andikisha.leave.application.service;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.leave.application.dto.response.LeavePolicyResponse;
import com.andikisha.leave.application.mapper.LeaveMapper;
import com.andikisha.leave.domain.model.LeaveType;
import com.andikisha.leave.domain.repository.LeavePolicyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class LeavePolicyService {

    private final LeavePolicyRepository policyRepository;
    private final LeaveMapper mapper;
    private final LeavePolicyInitializer initializer;

    public LeavePolicyService(LeavePolicyRepository policyRepository,
                               LeaveMapper mapper,
                               LeavePolicyInitializer initializer) {
        this.policyRepository = policyRepository;
        this.mapper = mapper;
        this.initializer = initializer;
    }

    public List<LeavePolicyResponse> getPolicies() {
        String tenantId = TenantContext.requireTenantId();
        return policyRepository.findByTenantIdAndActiveTrue(tenantId)
                .stream().map(mapper::toResponse).toList();
    }

    /**
     * Bootstraps Kenya Employment Act defaults for a newly-provisioned tenant.
     * Each policy is delegated to {@link LeavePolicyInitializer#savePolicyIfNotExists}
     * which runs in its own REQUIRES_NEW transaction, so a duplicate-delivery
     * constraint violation on one type does not roll back the remaining policies.
     */
    @Transactional
    public void initializeDefaultPolicies(String tenantId) {
        initializer.savePolicyIfNotExists(tenantId, LeaveType.ANNUAL, 21, 5, true, false);
        // Sick leave is self-certified; requiresApproval=false (Employment Act compliance)
        initializer.savePolicyIfNotExists(tenantId, LeaveType.SICK, 30, 0, false, true);
        initializer.savePolicyIfNotExists(tenantId, LeaveType.MATERNITY, 90, 0, true, true);
        initializer.savePolicyIfNotExists(tenantId, LeaveType.PATERNITY, 14, 0, true, false);
        initializer.savePolicyIfNotExists(tenantId, LeaveType.COMPASSIONATE, 5, 0, true, false);
    }
}