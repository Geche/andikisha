package com.andikisha.auth.domain.repository;

import com.andikisha.auth.domain.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmailAndTenantId(String email, String tenantId);

    Optional<User> findByPhoneNumberAndTenantId(String phoneNumber, String tenantId);

    Optional<User> findByIdAndTenantId(UUID id, String tenantId);

    Optional<User> findByEmployeeIdAndTenantId(UUID employeeId, String tenantId);

    boolean existsByEmailAndTenantId(String email, String tenantId);

    boolean existsByPhoneNumberAndTenantId(String phoneNumber, String tenantId);

    Page<User> findByTenantId(String tenantId, Pageable pageable);
}