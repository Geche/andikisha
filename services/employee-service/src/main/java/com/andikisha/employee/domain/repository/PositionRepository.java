package com.andikisha.employee.domain.repository;

import com.andikisha.employee.domain.model.Position;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PositionRepository extends JpaRepository<Position, UUID> {

    Optional<Position> findByIdAndTenantId(UUID id, String tenantId);

    List<Position> findByTenantIdAndActiveTrue(String tenantId);

    boolean existsByTenantIdAndTitle(String tenantId, String title);
}
