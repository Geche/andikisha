package com.andikisha.employee.unit;

import com.andikisha.common.exception.DuplicateResourceException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.employee.application.dto.request.CreateEmployeeRequest;
import com.andikisha.employee.application.dto.response.EmployeeDetailResponse;
import com.andikisha.employee.application.mapper.EmployeeMapper;
import com.andikisha.employee.application.port.EmployeeEventPublisher;
import com.andikisha.employee.application.service.EmployeeNumberGenerator;
import com.andikisha.employee.application.service.EmployeeService;
import com.andikisha.employee.domain.model.Employee;
import com.andikisha.employee.domain.repository.DepartmentRepository;
import com.andikisha.employee.domain.repository.EmployeeHistoryRepository;
import com.andikisha.employee.domain.repository.EmployeeRepository;
import com.andikisha.employee.domain.repository.PositionRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock private EmployeeRepository employeeRepository;
    @Mock private DepartmentRepository departmentRepository;
    @Mock private PositionRepository positionRepository;
    @Mock private EmployeeHistoryRepository historyRepository;
    @Mock private EmployeeMapper mapper;
    @Mock private EmployeeEventPublisher eventPublisher;
    @Mock private EmployeeNumberGenerator numberGenerator;

    @InjectMocks private EmployeeService employeeService;

    private static final String TENANT_ID = "test-tenant";

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void create_withValidRequest_createsEmployeeAndPublishesEvent() {
        var request = new CreateEmployeeRequest(
                "Jane", "Doe", "12345678", "+254722123456",
                "jane@test.com", "A123456789B", "1234567", "9876543",
                "PERMANENT", BigDecimal.valueOf(150_000),
                null, null, null, null, "KES",
                null, null, null, null, null
        );

        when(employeeRepository.existsByTenantIdAndNationalId(TENANT_ID, "12345678")).thenReturn(false);
        when(employeeRepository.existsByTenantIdAndPhoneNumber(TENANT_ID, "+254722123456")).thenReturn(false);
        when(employeeRepository.existsByTenantIdAndEmail(TENANT_ID, "jane@test.com")).thenReturn(false);
        when(numberGenerator.generate(TENANT_ID)).thenReturn("EMP-0001");
        when(employeeRepository.save(any(Employee.class))).thenAnswer(inv -> inv.getArgument(0));
        when(historyRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        EmployeeDetailResponse mockResponse = mock(EmployeeDetailResponse.class);
        when(mapper.toDetailResponse(any(Employee.class))).thenReturn(mockResponse);

        EmployeeDetailResponse result = employeeService.create(request, "admin-user");

        assertThat(result).isNotNull();
        verify(eventPublisher).publishEmployeeCreated(any(Employee.class));
        verify(historyRepository).save(any());
    }

    @Test
    void create_withDuplicateNationalId_throwsDuplicateException() {
        var request = new CreateEmployeeRequest(
                "Jane", "Doe", "12345678", "+254722123456",
                null, "A123456789B", "1234567", "9876543",
                "PERMANENT", BigDecimal.valueOf(150_000),
                null, null, null, null, null,
                null, null, null, null, null
        );

        when(employeeRepository.existsByTenantIdAndNationalId(TENANT_ID, "12345678")).thenReturn(true);

        assertThatThrownBy(() -> employeeService.create(request, "admin-user"))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("nationalId");
    }

    @Test
    @org.junit.jupiter.api.DisplayName("Creating employee with duplicate KRA PIN throws DuplicateResourceException")
    void createEmployee_duplicateKraPin_throwsDuplicateResourceException() {
        var request = new CreateEmployeeRequest(
                "Jane", "Doe", "12345678", "+254722123456",
                null, "A001234567B", "1234567", "9876543",
                "PERMANENT", BigDecimal.valueOf(150_000),
                null, null, null, null, null,
                null, null, null, null, null
        );

        when(employeeRepository.existsByTenantIdAndNationalId(TENANT_ID, "12345678")).thenReturn(false);
        when(employeeRepository.existsByTenantIdAndPhoneNumber(TENANT_ID, "+254722123456")).thenReturn(false);
        when(employeeRepository.existsByTenantIdAndKraPin(anyString(), eq("A001234567B"))).thenReturn(true);

        assertThatThrownBy(() -> employeeService.create(request, "admin-user"))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("kraPin");
    }

    @Test
    void terminate_capturesActualPreviousStatus() {
        var employeeId = java.util.UUID.randomUUID();
        Employee employee = mock(Employee.class);
        when(employee.getStatus()).thenReturn(com.andikisha.employee.domain.model.EmploymentStatus.SUSPENDED);
        when(employeeRepository.findByIdAndTenantId(employeeId, TENANT_ID))
                .thenReturn(java.util.Optional.of(employee));
        when(employeeRepository.save(any())).thenReturn(employee);
        when(historyRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        employeeService.terminate(employeeId, "Misconduct", "hr-user");

        // Verify history captured the actual status (SUSPENDED), not hardcoded "ACTIVE"
        verify(historyRepository).save(org.mockito.ArgumentMatchers.argThat(h -> {
            com.andikisha.employee.domain.model.EmployeeHistory history =
                    (com.andikisha.employee.domain.model.EmployeeHistory) h;
            return "SUSPENDED".equals(history.getOldValue());
        }));
    }
}
