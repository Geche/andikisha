package com.andikisha.leave.infrastructure.grpc;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.leave.domain.model.LeaveBalance;
import com.andikisha.leave.domain.model.LeaveType;
import com.andikisha.leave.domain.repository.LeaveBalanceRepository;
import com.andikisha.leave.domain.repository.LeaveRequestRepository;
import com.andikisha.proto.leave.EmployeeLeaveBalances;
import com.andikisha.proto.leave.EmployeeUnpaidDays;
import com.andikisha.proto.leave.GetLeaveBalanceRequest;
import com.andikisha.proto.leave.GetLeaveBalancesBatchRequest;
import com.andikisha.proto.leave.GetLeaveBalancesBatchResponse;
import com.andikisha.proto.leave.GetLeaveBalancesRequest;
import com.andikisha.proto.leave.GetUnpaidLeaveDaysForPeriodRequest;
import com.andikisha.proto.leave.GetUnpaidLeaveDaysForPeriodResponse;
import com.andikisha.proto.leave.LeaveBalanceResponse;
import com.andikisha.proto.leave.LeaveBalancesResponse;
import com.andikisha.proto.leave.LeaveServiceGrpc;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@GrpcService
public class LeaveGrpcService extends LeaveServiceGrpc.LeaveServiceImplBase {

    private static final Logger log = LoggerFactory.getLogger(LeaveGrpcService.class);

    private final LeaveBalanceRepository balanceRepository;
    private final LeaveRequestRepository requestRepository;

    public LeaveGrpcService(LeaveBalanceRepository balanceRepository,
                             LeaveRequestRepository requestRepository) {
        this.balanceRepository = balanceRepository;
        this.requestRepository = requestRepository;
    }

    @Override
    public void getLeaveBalance(GetLeaveBalanceRequest request,
                                StreamObserver<LeaveBalanceResponse> observer) {
        if (request.getTenantId().isBlank()) {
            observer.onError(Status.INVALID_ARGUMENT
                    .withDescription("tenant_id is required").asRuntimeException());
            return;
        }
        try {
            TenantContext.setTenantId(request.getTenantId());
            LeaveType leaveType = LeaveType.valueOf(request.getLeaveType().toUpperCase());
            UUID employeeId = UUID.fromString(request.getEmployeeId());

            Optional<LeaveBalance> balance = balanceRepository
                    .findByTenantIdAndEmployeeIdAndLeaveTypeAndYear(
                            request.getTenantId(), employeeId, leaveType, request.getYear());

            if (balance.isEmpty()) {
                observer.onError(Status.NOT_FOUND
                        .withDescription("No leave balance found for employee " + request.getEmployeeId()
                                + " type=" + request.getLeaveType()
                                + " year=" + request.getYear())
                        .asRuntimeException());
                return;
            }

            observer.onNext(toProto(balance.get()));
            observer.onCompleted();
        } catch (IllegalArgumentException e) {
            observer.onError(Status.INVALID_ARGUMENT
                    .withDescription("Invalid argument: " + e.getMessage()).asRuntimeException());
        } catch (Exception e) {
            log.error("GetLeaveBalance failed for employee {}", request.getEmployeeId(), e);
            observer.onError(Status.INTERNAL.withDescription("Internal error").asRuntimeException());
        } finally {
            TenantContext.clear();
        }
    }

    @Override
    public void getLeaveBalances(GetLeaveBalancesRequest request,
                                 StreamObserver<LeaveBalancesResponse> observer) {
        if (request.getTenantId().isBlank()) {
            observer.onError(Status.INVALID_ARGUMENT
                    .withDescription("tenant_id is required").asRuntimeException());
            return;
        }
        try {
            TenantContext.setTenantId(request.getTenantId());
            UUID employeeId = UUID.fromString(request.getEmployeeId());

            List<LeaveBalance> balances = balanceRepository
                    .findByTenantIdAndEmployeeIdAndYear(
                            request.getTenantId(), employeeId, request.getYear());

            LeaveBalancesResponse response = LeaveBalancesResponse.newBuilder()
                    .addAllBalances(balances.stream().map(this::toProto).toList())
                    .build();

            observer.onNext(response);
            observer.onCompleted();
        } catch (IllegalArgumentException e) {
            observer.onError(Status.INVALID_ARGUMENT
                    .withDescription("Invalid argument: " + e.getMessage()).asRuntimeException());
        } catch (Exception e) {
            log.error("GetLeaveBalances failed for employee {}", request.getEmployeeId(), e);
            observer.onError(Status.INTERNAL.withDescription("Internal error").asRuntimeException());
        } finally {
            TenantContext.clear();
        }
    }

    @Override
    public void getLeaveBalancesBatch(GetLeaveBalancesBatchRequest request,
                                       StreamObserver<GetLeaveBalancesBatchResponse> observer) {
        if (request.getTenantId().isBlank()) {
            observer.onError(Status.INVALID_ARGUMENT
                    .withDescription("tenant_id is required").asRuntimeException());
            return;
        }
        try {
            TenantContext.setTenantId(request.getTenantId());
            List<UUID> employeeIds = request.getEmployeeIdsList().stream()
                    .map(UUID::fromString)
                    .toList();

            List<LeaveBalance> allBalances = balanceRepository
                    .findByTenantIdAndEmployeeIdInAndYear(
                            request.getTenantId(), employeeIds, request.getYear());

            Map<String, List<LeaveBalanceResponse>> grouped = allBalances.stream()
                    .collect(Collectors.groupingBy(
                            b -> b.getEmployeeId().toString(),
                            Collectors.mapping(this::toProto, Collectors.toList())));

            List<EmployeeLeaveBalances> results = employeeIds.stream()
                    .map(empId -> EmployeeLeaveBalances.newBuilder()
                            .setEmployeeId(empId.toString())
                            .addAllBalances(grouped.getOrDefault(empId.toString(), List.of()))
                            .build())
                    .toList();

            observer.onNext(GetLeaveBalancesBatchResponse.newBuilder()
                    .addAllResults(results)
                    .build());
            observer.onCompleted();
        } catch (IllegalArgumentException e) {
            observer.onError(Status.INVALID_ARGUMENT
                    .withDescription("Invalid argument: " + e.getMessage()).asRuntimeException());
        } catch (Exception e) {
            log.error("GetLeaveBalancesBatch failed for tenant {}", request.getTenantId(), e);
            observer.onError(Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        } finally {
            TenantContext.clear();
        }
    }

    @Override
    public void getUnpaidLeaveDaysForPeriod(GetUnpaidLeaveDaysForPeriodRequest request,
                                             StreamObserver<GetUnpaidLeaveDaysForPeriodResponse> observer) {
        if (request.getTenantId().isBlank()) {
            observer.onError(Status.INVALID_ARGUMENT
                    .withDescription("tenant_id is required").asRuntimeException());
            return;
        }
        try {
            TenantContext.setTenantId(request.getTenantId());
            LocalDate periodStart = LocalDate.of(request.getYear(), request.getMonth(), 1);
            LocalDate periodEnd = periodStart.withDayOfMonth(periodStart.lengthOfMonth());

            List<UUID> employeeIds = request.getEmployeeIdsList().stream()
                    .map(UUID::fromString).toList();

            List<Object[]> rows = requestRepository.sumApprovedUnpaidDaysByPeriod(
                    request.getTenantId(), employeeIds, periodStart, periodEnd);

            Map<String, String> daysByEmployee = rows.stream()
                    .collect(Collectors.toMap(
                            r -> ((UUID) r[0]).toString(),
                            r -> ((BigDecimal) r[1]).toPlainString()));

            List<EmployeeUnpaidDays> results = employeeIds.stream()
                    .map(id -> EmployeeUnpaidDays.newBuilder()
                            .setEmployeeId(id.toString())
                            .setUnpaidDays(daysByEmployee.getOrDefault(id.toString(), "0"))
                            .build())
                    .toList();

            observer.onNext(GetUnpaidLeaveDaysForPeriodResponse.newBuilder()
                    .addAllResults(results)
                    .build());
            observer.onCompleted();
        } catch (IllegalArgumentException e) {
            observer.onError(Status.INVALID_ARGUMENT
                    .withDescription("Invalid argument: " + e.getMessage()).asRuntimeException());
        } catch (Exception e) {
            log.error("GetUnpaidLeaveDaysForPeriod failed for tenant {}", request.getTenantId(), e);
            observer.onError(Status.INTERNAL.withDescription("Internal error").asRuntimeException());
        } finally {
            TenantContext.clear();
        }
    }

    private LeaveBalanceResponse toProto(LeaveBalance b) {
        return LeaveBalanceResponse.newBuilder()
                .setEmployeeId(b.getEmployeeId().toString())
                .setLeaveType(b.getLeaveType().name())
                .setYear(b.getYear())
                .setAccrued(b.getAccrued().toPlainString())
                .setUsed(b.getUsed().toPlainString())
                .setCarriedOver(b.getCarriedOver().toPlainString())
                .setAvailable(b.getAvailable().toPlainString())
                .build();
    }
}
