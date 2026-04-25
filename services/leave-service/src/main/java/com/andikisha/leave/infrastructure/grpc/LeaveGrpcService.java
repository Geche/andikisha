package com.andikisha.leave.infrastructure.grpc;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.leave.domain.model.LeaveBalance;
import com.andikisha.leave.domain.model.LeaveType;
import com.andikisha.leave.domain.repository.LeaveBalanceRepository;
import com.andikisha.proto.leave.GetLeaveBalanceRequest;
import com.andikisha.proto.leave.GetLeaveBalancesRequest;
import com.andikisha.proto.leave.LeaveBalanceResponse;
import com.andikisha.proto.leave.LeaveBalancesResponse;
import com.andikisha.proto.leave.LeaveServiceGrpc;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@GrpcService
public class LeaveGrpcService extends LeaveServiceGrpc.LeaveServiceImplBase {

    private static final Logger log = LoggerFactory.getLogger(LeaveGrpcService.class);

    private final LeaveBalanceRepository balanceRepository;

    public LeaveGrpcService(LeaveBalanceRepository balanceRepository) {
        this.balanceRepository = balanceRepository;
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
