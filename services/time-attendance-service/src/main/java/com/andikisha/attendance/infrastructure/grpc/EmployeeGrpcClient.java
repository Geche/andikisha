package com.andikisha.attendance.infrastructure.grpc;

import com.andikisha.proto.employee.EmployeeResponse;
import com.andikisha.proto.employee.EmployeeServiceGrpc;
import com.andikisha.proto.employee.GetEmployeeRequest;
import io.grpc.Channel;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * Reads employee data from employee-service. Used by attendance ownership enforcement to resolve a
 * LINE_MANAGER's DEPARTMENT scope (AUTHZ-BACKLOG-005): the caller may read a team member's attendance
 * only when they share a department. Mirrors leave-service's client.
 */
@Component
public class EmployeeGrpcClient {

    private final EmployeeServiceGrpc.EmployeeServiceBlockingStub stub;

    public EmployeeGrpcClient(@GrpcClient("employee-service") Channel channel) {
        this.stub = EmployeeServiceGrpc.newBlockingStub(channel);
    }

    public Optional<EmployeeResponse> getEmployee(String tenantId, String employeeId) {
        try {
            EmployeeResponse response = stub.getEmployee(
                    GetEmployeeRequest.newBuilder()
                            .setTenantId(tenantId)
                            .setEmployeeId(employeeId)
                            .build());
            return Optional.of(response);
        } catch (StatusRuntimeException e) {
            if (e.getStatus().getCode() == Status.Code.NOT_FOUND) {
                return Optional.empty();
            }
            throw e;
        }
    }
}
