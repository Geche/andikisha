package com.andikisha.leave.integration;

import com.andikisha.leave.domain.model.LeaveBalance;
import com.andikisha.leave.domain.model.LeaveType;
import com.andikisha.leave.domain.repository.LeaveBalanceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers(disabledWithoutDocker = true)
@Import(FlywayAutoConfiguration.class)
class LeaveBalanceRepositoryTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("test_leave")
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
    private LeaveBalanceRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    private static final String TENANT_A  = "tenant-a";
    private static final String TENANT_B  = "tenant-b";
    private static final int    YEAR      = 2026;

    // ------------------------------------------------------------------
    // findByTenantIdAndEmployeeIdAndLeaveTypeAndYear
    // ------------------------------------------------------------------

    @Test
    void findByEmployeeAndType_returnsCorrectBalance() {
        UUID employee = UUID.randomUUID();
        repository.save(balance(TENANT_A, employee, LeaveType.ANNUAL, YEAR, 21));

        Optional<LeaveBalance> found = repository.findByTenantIdAndEmployeeIdAndLeaveTypeAndYear(
                TENANT_A, employee, LeaveType.ANNUAL, YEAR);

        assertThat(found).isPresent();
        assertThat(found.get().getAccrued()).isEqualByComparingTo("21");
    }

    @Test
    void findByEmployeeAndType_doesNotLeakAcrossTenants() {
        UUID employee = UUID.randomUUID();
        repository.save(balance(TENANT_A, employee, LeaveType.ANNUAL, YEAR, 21));

        Optional<LeaveBalance> found = repository.findByTenantIdAndEmployeeIdAndLeaveTypeAndYear(
                TENANT_B, employee, LeaveType.ANNUAL, YEAR);

        assertThat(found).isEmpty();
    }

    // ------------------------------------------------------------------
    // findByTenantIdAndEmployeeIdAndYear — list all types for one employee
    // ------------------------------------------------------------------

    @Test
    void findByTenantAndEmployeeAndYear_returnsAllTypesForEmployee() {
        UUID employee = UUID.randomUUID();
        repository.save(balance(TENANT_A, employee, LeaveType.ANNUAL, YEAR, 21));
        repository.save(balance(TENANT_A, employee, LeaveType.SICK, YEAR, 30));
        repository.save(balance(TENANT_A, UUID.randomUUID(), LeaveType.ANNUAL, YEAR, 21));

        List<LeaveBalance> balances = repository.findByTenantIdAndEmployeeIdAndYear(
                TENANT_A, employee, YEAR);

        assertThat(balances).hasSize(2);
    }

    // ------------------------------------------------------------------
    // freezeAllByEmployee — bulk freeze
    // ------------------------------------------------------------------

    @Test
    void freezeAllByEmployee_freezesAllBalancesForEmployee() {
        UUID employee = UUID.randomUUID();
        repository.save(balance(TENANT_A, employee, LeaveType.ANNUAL, YEAR, 21));
        repository.save(balance(TENANT_A, employee, LeaveType.SICK, YEAR, 30));

        repository.freezeAllByEmployee(TENANT_A, employee);

        List<LeaveBalance> frozen = repository.findByTenantIdAndEmployeeIdAndYear(
                TENANT_A, employee, YEAR);
        assertThat(frozen).allMatch(LeaveBalance::isFrozen);
    }

    @Test
    void freezeAllByEmployee_doesNotFreezeOtherEmployees() {
        UUID targetEmployee = UUID.randomUUID();
        UUID otherEmployee  = UUID.randomUUID();
        repository.save(balance(TENANT_A, targetEmployee, LeaveType.ANNUAL, YEAR, 21));
        repository.save(balance(TENANT_A, otherEmployee,  LeaveType.ANNUAL, YEAR, 21));

        repository.freezeAllByEmployee(TENANT_A, targetEmployee);

        List<LeaveBalance> others = repository.findByTenantIdAndEmployeeIdAndYear(
                TENANT_A, otherEmployee, YEAR);
        assertThat(others).noneMatch(LeaveBalance::isFrozen);
    }

    // ------------------------------------------------------------------
    // findActiveBalancesForYear — excludes frozen balances
    // ------------------------------------------------------------------

    @Test
    void findActiveBalancesForYear_excludesFrozenBalances() {
        UUID active     = UUID.randomUUID();
        UUID terminated = UUID.randomUUID();

        repository.save(balance(TENANT_A, active,     LeaveType.ANNUAL, YEAR, 21));
        LeaveBalance frozenBalance = balance(TENANT_A, terminated, LeaveType.ANNUAL, YEAR, 10);
        frozenBalance.freeze();
        repository.save(frozenBalance);

        List<LeaveBalance> result = repository.findActiveBalancesForYear(TENANT_A, YEAR);

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getEmployeeId()).isEqualTo(active);
    }

    @Test
    void findActiveBalancesForYear_doesNotLeakAcrossTenants() {
        UUID employee = UUID.randomUUID();
        repository.save(balance(TENANT_A, employee, LeaveType.ANNUAL, YEAR, 21));
        repository.save(balance(TENANT_B, employee, LeaveType.ANNUAL, YEAR, 21));

        List<LeaveBalance> result = repository.findActiveBalancesForYear(TENANT_A, YEAR);

        assertThat(result).hasSize(1);
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private LeaveBalance balance(String tenantId, UUID employeeId,
                                 LeaveType type, int year, int accrued) {
        return LeaveBalance.create(tenantId, employeeId, type, year,
                BigDecimal.valueOf(accrued), BigDecimal.ZERO);
    }
}
