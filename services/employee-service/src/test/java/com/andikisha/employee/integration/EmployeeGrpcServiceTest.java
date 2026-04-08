package com.andikisha.employee.integration;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.employee.application.dto.response.EmployeeDetailResponse;
import com.andikisha.employee.application.service.EmployeeQueryService;
import com.andikisha.employee.domain.exception.EmployeeNotFoundException;
import com.andikisha.employee.infrastructure.grpc.EmployeeGrpcService;
import com.andikisha.proto.employee.GetEmployeeRequest;
import com.andikisha.proto.employee.GetSalaryRequest;
import io.grpc.stub.StreamObserver;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeGrpcServiceTest {

    @Mock
    EmployeeQueryService queryService;

    @InjectMocks
    EmployeeGrpcService grpcService;

    private static final String TENANT_ID   = "grpc-test-tenant";
    private static final UUID   EMPLOYEE_ID = UUID.randomUUID();

    @AfterEach
    void verifyContextCleared() {
        assertThat(TenantContext.getTenantId()).isNull();
    }

    @Test
    void getEmployee_onSuccess_clearsTenantContext() {
        when(queryService.findById(EMPLOYEE_ID)).thenReturn(minimalResponse());

        @SuppressWarnings("unchecked")
        StreamObserver<com.andikisha.proto.employee.EmployeeResponse> observer = mock(StreamObserver.class);

        grpcService.getEmployee(buildGetRequest(), observer);

        verify(observer).onCompleted();
        verify(observer, never()).onError(any());
    }

    @Test
    void getEmployee_onException_stillClearsTenantContext() {
        when(queryService.findById(EMPLOYEE_ID))
                .thenThrow(new EmployeeNotFoundException(EMPLOYEE_ID));

        @SuppressWarnings("unchecked")
        StreamObserver<com.andikisha.proto.employee.EmployeeResponse> observer = mock(StreamObserver.class);

        grpcService.getEmployee(buildGetRequest(), observer);

        verify(observer).onError(any());
        verify(observer, never()).onCompleted();
    }

    @Test
    void getSalaryStructure_onSuccess_clearsTenantContext() {
        when(queryService.findById(EMPLOYEE_ID)).thenReturn(minimalResponse());

        @SuppressWarnings("unchecked")
        StreamObserver<com.andikisha.proto.employee.SalaryStructureResponse> observer = mock(StreamObserver.class);

        grpcService.getSalaryStructure(buildSalaryRequest(), observer);

        verify(observer).onCompleted();
        verify(observer, never()).onError(any());
    }

    @Test
    void getSalaryStructure_onException_stillClearsTenantContext() {
        when(queryService.findById(EMPLOYEE_ID))
                .thenThrow(new EmployeeNotFoundException(EMPLOYEE_ID));

        @SuppressWarnings("unchecked")
        StreamObserver<com.andikisha.proto.employee.SalaryStructureResponse> observer = mock(StreamObserver.class);

        grpcService.getSalaryStructure(buildSalaryRequest(), observer);

        verify(observer).onError(any());
    }

    private GetEmployeeRequest buildGetRequest() {
        return GetEmployeeRequest.newBuilder()
                .setTenantId(TENANT_ID)
                .setEmployeeId(EMPLOYEE_ID.toString())
                .build();
    }

    private GetSalaryRequest buildSalaryRequest() {
        return GetSalaryRequest.newBuilder()
                .setTenantId(TENANT_ID)
                .setEmployeeId(EMPLOYEE_ID.toString())
                .build();
    }

    private EmployeeDetailResponse minimalResponse() {
        return new EmployeeDetailResponse(
                EMPLOYEE_ID, TENANT_ID, "EMP-0001",
                "John", "Doe",
                "12345678", "+254700000001", null,
                "A123456789B", "1234567", "9876543",
                null, null,
                null, null, null, null,
                "PERMANENT", "ACTIVE",
                BigDecimal.valueOf(100_000), BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.ZERO, BigDecimal.ZERO,
                BigDecimal.valueOf(100_000), "KES",
                LocalDate.now().minusMonths(1), null, null,
                null, null, LocalDateTime.now()
        );
    }
}
