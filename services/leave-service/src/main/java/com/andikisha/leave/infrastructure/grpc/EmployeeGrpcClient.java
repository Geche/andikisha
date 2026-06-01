package com.andikisha.leave.infrastructure.grpc;

import com.andikisha.proto.employee.EmployeeResponse;
import com.andikisha.proto.employee.EmployeeServiceGrpc;
import com.andikisha.proto.employee.GetEmployeeRequest;
import com.andikisha.proto.employee.ListActiveByTenantRequest;
import io.grpc.Channel;
import io.grpc.StatusRuntimeException;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;

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
            if (e.getStatus().getCode() == io.grpc.Status.Code.NOT_FOUND) {
                return Optional.empty();
            }
            throw e;
        }
    }

    public List<EmployeeResponse> getEmployeesByDepartment(String tenantId, String departmentId) {
        // ListEmployees (paginated + filtered) is not yet implemented in EmployeeGrpcService.
        // Use listActiveByTenant and filter by departmentId client-side.
        // Dataset fits in one response for SME scale (< 1000 active employees).
        var response = stub.listActiveByTenant(
                ListActiveByTenantRequest.newBuilder()
                        .setTenantId(tenantId)
                        .build());
        return response.getEmployeesList().stream()
                .filter(e -> departmentId.equals(e.getDepartmentId()))
                .toList();
    }
}
