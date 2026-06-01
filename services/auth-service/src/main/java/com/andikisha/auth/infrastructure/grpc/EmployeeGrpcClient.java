package com.andikisha.auth.infrastructure.grpc;

import com.andikisha.proto.employee.EmployeeResponse;
import com.andikisha.proto.employee.EmployeeServiceGrpc;
import com.andikisha.proto.employee.GetEmployeeRequest;
import io.grpc.Channel;
import io.grpc.StatusRuntimeException;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class EmployeeGrpcClient {

    private final EmployeeServiceGrpc.EmployeeServiceBlockingStub stub;

    public EmployeeGrpcClient(@GrpcClient("employee-service") Channel channel) {
        this.stub = EmployeeServiceGrpc.newBlockingStub(channel);
    }

    public Optional<EmployeeResponse> getEmployee(String tenantId, String employeeId) {
        try {
            return Optional.of(stub.getEmployee(
                    GetEmployeeRequest.newBuilder()
                            .setTenantId(tenantId)
                            .setEmployeeId(employeeId)
                            .build()));
        } catch (StatusRuntimeException e) {
            if (e.getStatus().getCode() == io.grpc.Status.Code.NOT_FOUND) {
                return Optional.empty();
            }
            throw e;
        }
    }
}
