package com.andikisha.employee.unit;

import com.andikisha.common.scope.ResolvedScope;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.employee.application.mapper.EmployeeMapper;
import com.andikisha.employee.application.service.CallerScopeResolver;
import com.andikisha.employee.application.service.EmployeeQueryService;
import com.andikisha.employee.domain.repository.EmployeeRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EmployeeQueryServiceArchiveTest {

    @Mock private EmployeeRepository repository;
    @Mock private EmployeeMapper mapper;
    @Mock private CallerScopeResolver scopeResolver;

    @InjectMocks private EmployeeQueryService queryService;

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
    void findAll_defaultListing_excludesArchivedEmployees() {
        Pageable pageable = PageRequest.of(0, 20);
        when(scopeResolver.resolve(any(), eq(TENANT_ID), any())).thenReturn(ResolvedScope.all());
        when(repository.findByTenantIdAndArchivedAtIsNull(eq(TENANT_ID), eq(pageable)))
                .thenReturn(Page.empty(pageable));

        queryService.findAll("HR_MANAGER", null, null, null, null, pageable);

        // Default roster must query the archived-excluding method, never the raw findByTenantId
        verify(repository).findByTenantIdAndArchivedAtIsNull(TENANT_ID, pageable);
        verify(repository, never()).findByTenantId(eq(TENANT_ID), any());
    }
}
