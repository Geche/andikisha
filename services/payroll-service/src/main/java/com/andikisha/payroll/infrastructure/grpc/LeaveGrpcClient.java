package com.andikisha.payroll.infrastructure.grpc;

import com.andikisha.proto.leave.GetLeaveBalanceRequest;
import com.andikisha.proto.leave.GetLeaveBalancesRequest;
import com.andikisha.proto.leave.LeaveBalanceResponse;
import com.andikisha.proto.leave.LeaveBalancesResponse;
import com.andikisha.proto.leave.LeaveServiceGrpc;
import io.grpc.Channel;
import io.grpc.StatusRuntimeException;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Component
public class LeaveGrpcClient {

    private static final Logger log = LoggerFactory.getLogger(LeaveGrpcClient.class);

    private final LeaveServiceGrpc.LeaveServiceBlockingStub stub;

    public LeaveGrpcClient(@GrpcClient("leave-service") Channel channel) {
        this.stub = LeaveServiceGrpc.newBlockingStub(channel);
    }

    public List<LeaveBalanceResponse> getLeaveBalances(String tenantId, String employeeId, int year) {
        try {
            LeaveBalancesResponse response = stub.getLeaveBalances(
                    GetLeaveBalancesRequest.newBuilder()
                            .setTenantId(tenantId)
                            .setEmployeeId(employeeId)
                            .setYear(year)
                            .build());
            return response.getBalancesList();
        } catch (StatusRuntimeException e) {
            log.warn("Failed to fetch leave balances for employee {}: {}", employeeId, e.getStatus());
            return Collections.emptyList();
        }
    }

    public Optional<LeaveBalanceResponse> getLeaveBalance(String tenantId, String employeeId,
                                                          String leaveType, int year) {
        try {
            LeaveBalanceResponse response = stub.getLeaveBalance(
                    GetLeaveBalanceRequest.newBuilder()
                            .setTenantId(tenantId)
                            .setEmployeeId(employeeId)
                            .setLeaveType(leaveType)
                            .setYear(year)
                            .build());
            return Optional.of(response);
        } catch (StatusRuntimeException e) {
            if (e.getStatus().getCode() == io.grpc.Status.Code.NOT_FOUND) {
                return Optional.empty();
            }
            log.warn("Failed to fetch {} leave balance for employee {}: {}",
                    leaveType, employeeId, e.getStatus());
            return Optional.empty();
        }
    }
}
