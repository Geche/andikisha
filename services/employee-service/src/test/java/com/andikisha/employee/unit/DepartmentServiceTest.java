package com.andikisha.employee.unit;

import com.andikisha.common.exception.DuplicateResourceException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.employee.application.dto.response.DepartmentResponse;
import com.andikisha.employee.application.mapper.EmployeeMapper;
import com.andikisha.employee.application.service.DepartmentService;
import com.andikisha.employee.domain.exception.DepartmentNotFoundException;
import com.andikisha.employee.domain.model.Department;
import com.andikisha.employee.domain.model.EmploymentStatus;
import com.andikisha.employee.domain.repository.DepartmentRepository;
import com.andikisha.employee.domain.repository.EmployeeRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DepartmentServiceTest {

    @Mock private DepartmentRepository departmentRepository;
    @Mock private EmployeeRepository employeeRepository;
    @Mock private EmployeeMapper mapper;

    @InjectMocks private DepartmentService departmentService;

    private static final String TENANT_ID = "dept-test-tenant";

    @BeforeEach
    void setUp() {
        TenantContext.setTenantId(TENANT_ID);
    }

    @AfterEach
    void tearDown() {
        TenantContext.clear();
    }

    @Test
    void findAll_returnsMappedDepartmentsWithEmployeeCounts() {
        Department dept = mock(Department.class);
        UUID deptId = UUID.randomUUID();
        when(dept.getId()).thenReturn(deptId);

        DepartmentResponse baseResponse = new DepartmentResponse(deptId, "Engineering", null, null, 0, true);
        when(departmentRepository.findByTenantIdAndActiveTrue(TENANT_ID)).thenReturn(List.of(dept));
        when(mapper.toResponse(dept)).thenReturn(baseResponse);
        when(employeeRepository.countActiveByTenantIdAndDepartmentId(TENANT_ID, deptId, EmploymentStatus.TERMINATED)).thenReturn(5L);

        List<DepartmentResponse> result = departmentService.findAll();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).employeeCount()).isEqualTo(5L);
    }

    @Test
    void create_withUniqueName_savesDepartmentAndReturnsResponse() {
        when(departmentRepository.existsByTenantIdAndName(TENANT_ID, "Finance")).thenReturn(false);
        Department saved = mock(Department.class);
        when(departmentRepository.save(any(Department.class))).thenReturn(saved);

        DepartmentResponse expectedResponse = new DepartmentResponse(UUID.randomUUID(), "Finance", null, null, 0, true);
        when(mapper.toResponse(saved)).thenReturn(expectedResponse);

        DepartmentResponse result = departmentService.create("Finance", null, null);

        assertThat(result.name()).isEqualTo("Finance");
        verify(departmentRepository).save(any(Department.class));
    }

    @Test
    void create_withDuplicateName_throwsDuplicateResourceException() {
        when(departmentRepository.existsByTenantIdAndName(TENANT_ID, "HR")).thenReturn(true);

        assertThatThrownBy(() -> departmentService.create("HR", null, null))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("name");
    }

    @Test
    void create_withNonExistentParentId_throwsDepartmentNotFoundException() {
        UUID parentId = UUID.randomUUID();
        when(departmentRepository.existsByTenantIdAndName(TENANT_ID, "Sub-dept")).thenReturn(false);
        when(departmentRepository.findByIdAndTenantId(parentId, TENANT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> departmentService.create("Sub-dept", null, parentId))
                .isInstanceOf(DepartmentNotFoundException.class);
    }

    @Test
    void update_withNonExistentId_throwsDepartmentNotFoundException() {
        UUID id = UUID.randomUUID();
        when(departmentRepository.findByIdAndTenantId(id, TENANT_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> departmentService.update(id, "New Name", null))
                .isInstanceOf(DepartmentNotFoundException.class);
    }
}
