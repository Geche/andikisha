package com.andikisha.employee.integration;

import com.andikisha.common.domain.Money;
import com.andikisha.employee.domain.model.Employee;
import com.andikisha.employee.domain.model.EmploymentStatus;
import com.andikisha.employee.domain.model.EmploymentType;
import com.andikisha.employee.domain.model.SalaryStructure;
import com.andikisha.employee.domain.repository.EmployeeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers(disabledWithoutDocker = true)
@Import(FlywayAutoConfiguration.class)
class EmployeeRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("test_employee")
            .withUsername("test")
            .withPassword("test");

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.flyway.enabled", () -> "true");
        registry.add("spring.flyway.locations", () -> "classpath:db/migration");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "validate");
    }

    @Autowired
    EmployeeRepository employeeRepository;

    private static final String TENANT_A = "tenant-alpha";
    private static final String TENANT_B = "tenant-beta";

    @BeforeEach
    void setUp() {
        employeeRepository.deleteAll();
    }

    private Employee buildEmployee(String tenantId, String number, String nationalId, String phone) {
        SalaryStructure salary = new SalaryStructure(
                Money.of(BigDecimal.valueOf(100_000), "KES"),
                null, null, null, null);
        return Employee.create(
                tenantId, number, "John", "Doe",
                nationalId, phone, null,
                "A123456789B", "1234567", "9876543",
                EmploymentType.PERMANENT, salary, null, null,
                LocalDate.now().minusMonths(1));
    }

    @Test
    void findByIdAndTenantId_enforcesTenantIsolation() {
        Employee empA = employeeRepository.save(
                buildEmployee(TENANT_A, "EMP-0001", "11111111", "+254700000001"));
        employeeRepository.save(
                buildEmployee(TENANT_B, "EMP-0001", "22222222", "+254700000002"));

        assertThat(employeeRepository.findByIdAndTenantId(empA.getId(), TENANT_A)).isPresent();
        assertThat(employeeRepository.findByIdAndTenantId(empA.getId(), TENANT_B)).isEmpty();
    }

    @Test
    void searchByTenantId_returnsOnlyMatchingTenantResults() {
        employeeRepository.save(buildEmployee(TENANT_A, "EMP-0001", "11111111", "+254700000001"));
        employeeRepository.save(buildEmployee(TENANT_B, "EMP-0002", "22222222", "+254700000002"));

        var results = employeeRepository.searchByTenantId(TENANT_A, "John", PageRequest.of(0, 10));

        assertThat(results.getContent()).hasSize(1);
        assertThat(results.getContent().get(0).getTenantId()).isEqualTo(TENANT_A);
    }

    @Test
    void countActiveByTenantId_excludesTerminatedAndCountsCorrectly() {
        Employee active = buildEmployee(TENANT_A, "EMP-0001", "11111111", "+254700000001");
        active.confirmProbation();
        employeeRepository.save(active);

        Employee terminated = buildEmployee(TENANT_A, "EMP-0002", "33333333", "+254700000003");
        terminated.confirmProbation();
        terminated.terminate("Resigned");
        employeeRepository.save(terminated);

        // Separate tenant — should not affect count
        employeeRepository.save(buildEmployee(TENANT_B, "EMP-0001", "44444444", "+254700000004"));

        assertThat(employeeRepository.countActiveByTenantId(TENANT_A, EmploymentStatus.TERMINATED)).isEqualTo(1);
    }

    @Test
    void existsByTenantIdAndNationalId_returnsTrueOnlyForSameTenant() {
        employeeRepository.save(buildEmployee(TENANT_A, "EMP-0001", "55555555", "+254700000005"));

        assertThat(employeeRepository.existsByTenantIdAndNationalId(TENANT_A, "55555555")).isTrue();
        assertThat(employeeRepository.existsByTenantIdAndNationalId(TENANT_B, "55555555")).isFalse();
    }

    @Test
    void findByTenantIdAndStatus_returnsOnlyRequestedStatus() {
        Employee active = buildEmployee(TENANT_A, "EMP-0001", "66666666", "+254700000006");
        active.confirmProbation();
        employeeRepository.save(active);

        Employee onProbation = buildEmployee(TENANT_A, "EMP-0002", "77777777", "+254700000007");
        employeeRepository.save(onProbation);

        var activeList = employeeRepository.findByTenantIdAndStatus(TENANT_A, EmploymentStatus.ACTIVE);
        var probationList = employeeRepository.findByTenantIdAndStatus(TENANT_A, EmploymentStatus.ON_PROBATION);

        assertThat(activeList).hasSize(1);
        assertThat(probationList).hasSize(1);
    }
}
