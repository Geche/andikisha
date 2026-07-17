package com.andikisha.recruitment.domain.repository;

import com.andikisha.recruitment.domain.model.StageTransition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface StageTransitionRepository extends JpaRepository<StageTransition, UUID> {

    List<StageTransition> findByTenantIdAndApplicantIdOrderByMovedAtAsc(String tenantId, UUID applicantId);
}
