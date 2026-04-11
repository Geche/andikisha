package com.andikisha.leave.domain.repository;

import com.andikisha.leave.domain.model.LeavePolicy;
import com.andikisha.leave.domain.model.LeaveType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface LeavePolicyRepository extends JpaRepository<LeavePolicy, UUID> {

    List<LeavePolicy> findByTenantIdAndActiveTrue(String tenantId);

    Optional<LeavePolicy> findByTenantIdAndLeaveType(String tenantId, LeaveType leaveType);
}