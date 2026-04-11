package com.andikisha.leave.integration;

import com.andikisha.leave.domain.model.LeaveRequest;
import com.andikisha.leave.domain.model.LeaveRequestStatus;
import com.andikisha.leave.domain.model.LeaveType;
import com.andikisha.leave.domain.repository.LeaveRequestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.flyway.FlywayAutoConfiguration;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ActiveProfiles("test")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Testcontainers(disabledWithoutDocker = true)
@Import(FlywayAutoConfiguration.class)
class LeaveRequestRepositoryTest {

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
    private LeaveRequestRepository repository;

    @BeforeEach
    void setUp() {
        repository.deleteAll();
    }

    private static final String TENANT_A  = "tenant-a";
    private static final String TENANT_B  = "tenant-b";
    private static final UUID   EMPLOYEE  = UUID.randomUUID();

    // ------------------------------------------------------------------
    // findByIdAndTenantId — tenant isolation
    // ------------------------------------------------------------------

    @Test
    void findByIdAndTenantId_returnsRequestForCorrectTenant() {
        LeaveRequest saved = repository.save(pendingRequest(TENANT_A, EMPLOYEE));

        Optional<LeaveRequest> found = repository.findByIdAndTenantId(saved.getId(), TENANT_A);
        assertThat(found).isPresent();
    }

    @Test
    void findByIdAndTenantId_doesNotLeakAcrossTenants() {
        LeaveRequest saved = repository.save(pendingRequest(TENANT_A, EMPLOYEE));

        Optional<LeaveRequest> found = repository.findByIdAndTenantId(saved.getId(), TENANT_B);
        assertThat(found).isEmpty();
    }

    // ------------------------------------------------------------------
    // findByTenantIdOrderByCreatedAtDesc — ordering
    // ------------------------------------------------------------------

    @Test
    void findByTenantIdOrderByCreatedAtDesc_returnsOnlyForTenant() {
        repository.save(pendingRequest(TENANT_A, EMPLOYEE));
        repository.save(pendingRequest(TENANT_A, EMPLOYEE));
        repository.save(pendingRequest(TENANT_B, UUID.randomUUID()));

        Page<LeaveRequest> page = repository.findByTenantIdOrderByCreatedAtDesc(
                TENANT_A, PageRequest.of(0, 20));

        assertThat(page.getTotalElements()).isEqualTo(2);
    }

    // ------------------------------------------------------------------
    // findByTenantIdAndStatusOrderByCreatedAtDesc — status filter
    // ------------------------------------------------------------------

    @Test
    void findByTenantIdAndStatus_filtersCorrectly() {
        repository.save(pendingRequest(TENANT_A, EMPLOYEE));

        Page<LeaveRequest> pending = repository.findByTenantIdAndStatusOrderByCreatedAtDesc(
                TENANT_A, LeaveRequestStatus.PENDING, PageRequest.of(0, 20));
        Page<LeaveRequest> approved = repository.findByTenantIdAndStatusOrderByCreatedAtDesc(
                TENANT_A, LeaveRequestStatus.APPROVED, PageRequest.of(0, 20));

        assertThat(pending.getTotalElements()).isEqualTo(1);
        assertThat(approved.getTotalElements()).isEqualTo(0);
    }

    // ------------------------------------------------------------------
    // findByTenantIdAndEmployeeIdOrderByCreatedAtDesc
    // ------------------------------------------------------------------

    @Test
    void findByTenantIdAndEmployeeId_returnsOnlyThatEmployeesRequests() {
        UUID other = UUID.randomUUID();
        repository.save(pendingRequest(TENANT_A, EMPLOYEE));
        repository.save(pendingRequest(TENANT_A, other));

        Page<LeaveRequest> result = repository.findByTenantIdAndEmployeeIdOrderByCreatedAtDesc(
                TENANT_A, EMPLOYEE, PageRequest.of(0, 20));

        assertThat(result.getTotalElements()).isEqualTo(1);
        assertThat(result.getContent().get(0).getEmployeeId()).isEqualTo(EMPLOYEE);
    }

    // ------------------------------------------------------------------
    // findOverlappingByEmployee — overlap detection
    // ------------------------------------------------------------------

    @Test
    void findOverlappingByEmployee_detectsOverlap() {
        // Approved leave: days 10-20
        LeaveRequest approved = pendingRequest(TENANT_A, EMPLOYEE,
                LocalDate.now().plusDays(10), LocalDate.now().plusDays(20));
        approved.approve(UUID.randomUUID(), "Manager");
        repository.save(approved);

        // Query for days 15-25 — overlaps
        List<LeaveRequest> overlapping = repository.findOverlappingByEmployee(
                TENANT_A, EMPLOYEE, LeaveRequestStatus.APPROVED,
                LocalDate.now().plusDays(15), LocalDate.now().plusDays(25));

        assertThat(overlapping).hasSize(1);
    }

    @Test
    void findOverlappingByEmployee_noOverlapWhenAdjacentDates() {
        LeaveRequest approved = pendingRequest(TENANT_A, EMPLOYEE,
                LocalDate.now().plusDays(10), LocalDate.now().plusDays(14));
        approved.approve(UUID.randomUUID(), "Manager");
        repository.save(approved);

        // Query starts exactly on the day after the leave ends — should not overlap
        List<LeaveRequest> overlapping = repository.findOverlappingByEmployee(
                TENANT_A, EMPLOYEE, LeaveRequestStatus.APPROVED,
                LocalDate.now().plusDays(15), LocalDate.now().plusDays(20));

        assertThat(overlapping).isEmpty();
    }

    @Test
    void findOverlappingByEmployee_doesNotIncludePendingOrRejectedRequests() {
        // Only APPROVED requests should trigger the overlap guard
        repository.save(pendingRequest(TENANT_A, EMPLOYEE,
                LocalDate.now().plusDays(10), LocalDate.now().plusDays(14)));

        List<LeaveRequest> overlapping = repository.findOverlappingByEmployee(
                TENANT_A, EMPLOYEE, LeaveRequestStatus.APPROVED,
                LocalDate.now().plusDays(10), LocalDate.now().plusDays(14));

        assertThat(overlapping).isEmpty();
    }

    @Test
    void findOverlappingByEmployee_doesNotLeakAcrossEmployees() {
        UUID otherEmployee = UUID.randomUUID();
        LeaveRequest approved = pendingRequest(TENANT_A, otherEmployee,
                LocalDate.now().plusDays(10), LocalDate.now().plusDays(20));
        approved.approve(UUID.randomUUID(), "Manager");
        repository.save(approved);

        List<LeaveRequest> overlapping = repository.findOverlappingByEmployee(
                TENANT_A, EMPLOYEE, LeaveRequestStatus.APPROVED,
                LocalDate.now().plusDays(10), LocalDate.now().plusDays(20));

        assertThat(overlapping).isEmpty();
    }

    // ------------------------------------------------------------------
    // sumDaysByStatus — pending balance reservation
    // ------------------------------------------------------------------

    @Test
    void sumDaysByStatus_sumsPendingDaysForEmployee() {
        // Two PENDING requests: 5 + 5 = 10 days (factory helper always uses BigDecimal.valueOf(5))
        repository.save(pendingRequest(TENANT_A, EMPLOYEE,
                LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 5)));   // 5 days
        repository.save(pendingRequest(TENANT_A, EMPLOYEE,
                LocalDate.of(2026, 6, 1), LocalDate.of(2026, 6, 3)));   // 5 days (factory default)

        BigDecimal total = repository.sumDaysByStatus(
                TENANT_A, EMPLOYEE, LeaveType.ANNUAL, LeaveRequestStatus.PENDING,
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31));

        assertThat(total).isEqualByComparingTo("10"); // 5 + 5
    }

    @Test
    void sumDaysByStatus_returnsZeroWhenNoMatchingRows() {
        BigDecimal total = repository.sumDaysByStatus(
                TENANT_A, EMPLOYEE, LeaveType.ANNUAL, LeaveRequestStatus.PENDING,
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31));

        assertThat(total).isEqualByComparingTo("0");
    }

    @Test
    void sumDaysByStatus_excludesApprovedRequests() {
        LeaveRequest approved = pendingRequest(TENANT_A, EMPLOYEE,
                LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 5));
        approved.approve(UUID.randomUUID(), "Manager");
        repository.save(approved);

        BigDecimal pendingTotal = repository.sumDaysByStatus(
                TENANT_A, EMPLOYEE, LeaveType.ANNUAL, LeaveRequestStatus.PENDING,
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31));

        assertThat(pendingTotal).isEqualByComparingTo("0");
    }

    @Test
    void sumDaysByStatus_doesNotLeakAcrossTenants() {
        repository.save(pendingRequest(TENANT_B, EMPLOYEE,
                LocalDate.of(2026, 5, 1), LocalDate.of(2026, 5, 5)));

        BigDecimal total = repository.sumDaysByStatus(
                TENANT_A, EMPLOYEE, LeaveType.ANNUAL, LeaveRequestStatus.PENDING,
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 12, 31));

        assertThat(total).isEqualByComparingTo("0");
    }

    // ------------------------------------------------------------------
    // Helpers
    // ------------------------------------------------------------------

    private LeaveRequest pendingRequest(String tenantId, UUID employeeId) {
        return pendingRequest(tenantId, employeeId,
                LocalDate.now().plusDays(7), LocalDate.now().plusDays(11));
    }

    private LeaveRequest pendingRequest(String tenantId, UUID employeeId,
                                        LocalDate start, LocalDate end) {
        return LeaveRequest.create(
                tenantId, employeeId, "Test Employee", LeaveType.ANNUAL,
                start, end, BigDecimal.valueOf(5), "Test reason");
    }
}
