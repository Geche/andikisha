package com.andikisha.employee.domain.repository;

import com.andikisha.employee.domain.model.Employee;
import com.andikisha.employee.domain.model.EmploymentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

    Optional<Employee> findByIdAndTenantId(UUID id, String tenantId);

    Page<Employee> findByTenantId(String tenantId, Pageable pageable);

    Page<Employee> findByTenantIdAndStatus(String tenantId, EmploymentStatus status, Pageable pageable);

    Page<Employee> findByTenantIdAndDepartmentId(String tenantId, UUID departmentId, Pageable pageable);

    List<Employee> findByTenantIdAndStatus(String tenantId, EmploymentStatus status);

    boolean existsByTenantIdAndNationalId(String tenantId, String nationalId);

    boolean existsByTenantIdAndPhoneNumber(String tenantId, String phoneNumber);

    boolean existsByTenantIdAndEmail(String tenantId, String email);

    boolean existsByTenantIdAndKraPin(String tenantId, String kraPin);

    @Query("""
        SELECT e FROM Employee e
        WHERE e.tenantId = :tenantId
        AND (LOWER(e.firstName) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(e.lastName) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(e.employeeNumber) LIKE LOWER(CONCAT('%', :search, '%'))
            OR LOWER(e.email) LIKE LOWER(CONCAT('%', :search, '%')))
        """)
    Page<Employee> searchByTenantId(String tenantId, String search, Pageable pageable);

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.tenantId = :tenantId AND e.status <> :excluded")
    long countActiveByTenantId(@Param("tenantId") String tenantId,
                               @Param("excluded") EmploymentStatus excluded);

    @Query("SELECT COUNT(e) FROM Employee e WHERE e.tenantId = :tenantId AND e.department.id = :departmentId AND e.status <> :excluded")
    long countActiveByTenantIdAndDepartmentId(@Param("tenantId") String tenantId,
                                              @Param("departmentId") UUID departmentId,
                                              @Param("excluded") EmploymentStatus excluded);

    @Query("SELECT MAX(e.employeeNumber) FROM Employee e WHERE e.tenantId = :tenantId")
    String findMaxEmployeeNumber(String tenantId);
}
