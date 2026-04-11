package com.andikisha.leave.application.service;

import com.andikisha.leave.domain.model.LeavePolicy;
import com.andikisha.leave.domain.model.LeaveType;
import com.andikisha.leave.domain.repository.LeavePolicyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

/**
 * Isolated bean that saves a single leave policy in its own REQUIRES_NEW transaction.
 * <p>
 * This must be a separate Spring-managed bean (not a method on LeavePolicyService)
 * so that the REQUIRES_NEW boundary is enforced via the AOP proxy. Calling
 * savePolicyIfNotExists via {@code this} inside LeavePolicyService would bypass
 * the proxy and silently inherit the outer transaction.
 */
@Service
public class LeavePolicyInitializer {

    private static final Logger log = LoggerFactory.getLogger(LeavePolicyInitializer.class);

    private final LeavePolicyRepository policyRepository;

    public LeavePolicyInitializer(LeavePolicyRepository policyRepository) {
        this.policyRepository = policyRepository;
    }

    /**
     * Inserts the policy if it does not already exist.
     * Runs in a brand-new transaction so a unique-constraint violation (duplicate
     * TenantCreatedEvent delivery) rolls back only this single insert, leaving the
     * sibling policies in the caller's transaction unaffected.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void savePolicyIfNotExists(String tenantId, LeaveType type,
                                      int days, int carryOver,
                                      boolean requiresApproval,
                                      boolean requiresMedicalCert) {
        if (policyRepository.findByTenantIdAndLeaveType(tenantId, type).isPresent()) {
            return;
        }
        try {
            LeavePolicy policy = LeavePolicy.create(
                    tenantId, type, days, carryOver,
                    requiresApproval, requiresMedicalCert);
            policyRepository.save(policy);
        } catch (DataIntegrityViolationException e) {
            log.warn("Leave policy {} already exists for tenant {} (duplicate event?), skipping",
                    type, tenantId);
        }
    }
}
