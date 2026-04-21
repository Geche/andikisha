package com.andikisha.leave.unit;

import com.andikisha.leave.domain.model.LeaveBalance;
import com.andikisha.leave.domain.model.LeaveType;
import com.andikisha.leave.domain.repository.LeaveBalanceRepository;
import com.andikisha.leave.infrastructure.grpc.LeaveGrpcService;
import com.andikisha.proto.leave.GetLeaveBalanceRequest;
import com.andikisha.proto.leave.GetLeaveBalancesRequest;
import com.andikisha.proto.leave.LeaveBalanceResponse;
import com.andikisha.proto.leave.LeaveBalancesResponse;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import io.grpc.stub.StreamObserver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LeaveGrpcServiceTest {

    private static final String TENANT_ID   = "grpc-test-tenant";
    private static final UUID   EMPLOYEE_ID = UUID.randomUUID();
    private static final int    YEAR        = 2024;

    @Mock LeaveBalanceRepository balanceRepository;
    @Mock StreamObserver<LeaveBalanceResponse>  singleObserver;
    @Mock StreamObserver<LeaveBalancesResponse> listObserver;

    private LeaveGrpcService service;

    @BeforeEach
    void setUp() {
        service = new LeaveGrpcService(balanceRepository);
    }

    // -------------------------------------------------------------------------
    // getLeaveBalance
    // -------------------------------------------------------------------------

    @Test
    void getLeaveBalance_returnsBalance_whenFound() {
        LeaveBalance balance = buildBalance(LeaveType.ANNUAL, 21, 5, 0);
        when(balanceRepository.findByTenantIdAndEmployeeIdAndLeaveTypeAndYear(
                TENANT_ID, EMPLOYEE_ID, LeaveType.ANNUAL, YEAR))
                .thenReturn(Optional.of(balance));

        service.getLeaveBalance(
                GetLeaveBalanceRequest.newBuilder()
                        .setTenantId(TENANT_ID)
                        .setEmployeeId(EMPLOYEE_ID.toString())
                        .setLeaveType("ANNUAL")
                        .setYear(YEAR)
                        .build(),
                singleObserver);

        ArgumentCaptor<LeaveBalanceResponse> captor = ArgumentCaptor.forClass(LeaveBalanceResponse.class);
        verify(singleObserver).onNext(captor.capture());
        verify(singleObserver).onCompleted();

        LeaveBalanceResponse resp = captor.getValue();
        assertThat(resp.getEmployeeId()).isEqualTo(EMPLOYEE_ID.toString());
        assertThat(resp.getLeaveType()).isEqualTo("ANNUAL");
        assertThat(resp.getAccrued()).isEqualTo(21.0);
        assertThat(resp.getUsed()).isEqualTo(5.0);
        assertThat(resp.getAvailable()).isEqualTo(16.0);
    }

    @Test
    void getLeaveBalance_returnsNotFound_whenMissing() {
        when(balanceRepository.findByTenantIdAndEmployeeIdAndLeaveTypeAndYear(any(), any(), any(), anyInt()))
                .thenReturn(Optional.empty());

        service.getLeaveBalance(
                GetLeaveBalanceRequest.newBuilder()
                        .setTenantId(TENANT_ID)
                        .setEmployeeId(EMPLOYEE_ID.toString())
                        .setLeaveType("SICK")
                        .setYear(YEAR)
                        .build(),
                singleObserver);

        ArgumentCaptor<Throwable> captor = ArgumentCaptor.forClass(Throwable.class);
        verify(singleObserver).onError(captor.capture());
        assertThat(((StatusRuntimeException) captor.getValue()).getStatus().getCode())
                .isEqualTo(Status.Code.NOT_FOUND);
    }

    @Test
    void getLeaveBalance_returnsInvalidArgument_whenTenantIdBlank() {
        service.getLeaveBalance(
                GetLeaveBalanceRequest.newBuilder()
                        .setTenantId("")
                        .setEmployeeId(EMPLOYEE_ID.toString())
                        .setLeaveType("ANNUAL")
                        .setYear(YEAR)
                        .build(),
                singleObserver);

        ArgumentCaptor<Throwable> captor = ArgumentCaptor.forClass(Throwable.class);
        verify(singleObserver).onError(captor.capture());
        assertThat(((StatusRuntimeException) captor.getValue()).getStatus().getCode())
                .isEqualTo(Status.Code.INVALID_ARGUMENT);
    }

    @Test
    void getLeaveBalance_returnsInvalidArgument_whenLeaveTypeUnknown() {
        service.getLeaveBalance(
                GetLeaveBalanceRequest.newBuilder()
                        .setTenantId(TENANT_ID)
                        .setEmployeeId(EMPLOYEE_ID.toString())
                        .setLeaveType("BOGUS_TYPE")
                        .setYear(YEAR)
                        .build(),
                singleObserver);

        ArgumentCaptor<Throwable> captor = ArgumentCaptor.forClass(Throwable.class);
        verify(singleObserver).onError(captor.capture());
        assertThat(((StatusRuntimeException) captor.getValue()).getStatus().getCode())
                .isEqualTo(Status.Code.INVALID_ARGUMENT);
    }

    // -------------------------------------------------------------------------
    // getLeaveBalances
    // -------------------------------------------------------------------------

    @Test
    void getLeaveBalances_returnsAllBalancesForEmployee() {
        List<LeaveBalance> balances = List.of(
                buildBalance(LeaveType.ANNUAL, 21, 3, 0),
                buildBalance(LeaveType.SICK, 30, 2, 0),
                buildBalance(LeaveType.UNPAID, 0, 5, 0)
        );
        when(balanceRepository.findByTenantIdAndEmployeeIdAndYear(TENANT_ID, EMPLOYEE_ID, YEAR))
                .thenReturn(balances);

        service.getLeaveBalances(
                GetLeaveBalancesRequest.newBuilder()
                        .setTenantId(TENANT_ID)
                        .setEmployeeId(EMPLOYEE_ID.toString())
                        .setYear(YEAR)
                        .build(),
                listObserver);

        ArgumentCaptor<LeaveBalancesResponse> captor = ArgumentCaptor.forClass(LeaveBalancesResponse.class);
        verify(listObserver).onNext(captor.capture());
        verify(listObserver).onCompleted();

        assertThat(captor.getValue().getBalancesList()).hasSize(3);
        assertThat(captor.getValue().getBalancesList())
                .extracting(LeaveBalanceResponse::getLeaveType)
                .containsExactly("ANNUAL", "SICK", "UNPAID");
    }

    @Test
    void getLeaveBalances_returnsEmptyList_whenNoBalancesFound() {
        when(balanceRepository.findByTenantIdAndEmployeeIdAndYear(any(), any(), anyInt()))
                .thenReturn(List.of());

        service.getLeaveBalances(
                GetLeaveBalancesRequest.newBuilder()
                        .setTenantId(TENANT_ID)
                        .setEmployeeId(EMPLOYEE_ID.toString())
                        .setYear(YEAR)
                        .build(),
                listObserver);

        ArgumentCaptor<LeaveBalancesResponse> captor = ArgumentCaptor.forClass(LeaveBalancesResponse.class);
        verify(listObserver).onNext(captor.capture());
        verify(listObserver).onCompleted();
        assertThat(captor.getValue().getBalancesList()).isEmpty();
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private LeaveBalance buildBalance(LeaveType type, double accrued, double used, double carriedOver) {
        LeaveBalance balance = LeaveBalance.create(
                TENANT_ID, EMPLOYEE_ID, type, YEAR,
                BigDecimal.valueOf(accrued), BigDecimal.valueOf(carriedOver));
        if (used > 0) {
            // Directly set used via ReflectionTestUtils since deduct() validates available days
            ReflectionTestUtils.setField(balance, "used", BigDecimal.valueOf(used));
        }
        return balance;
    }
}
