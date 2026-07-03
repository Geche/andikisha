package com.andikisha.document.infrastructure.grpc;

import com.andikisha.proto.employee.EmployeeResponse;
import com.andikisha.proto.employee.EmployeeServiceGrpc;
import com.andikisha.proto.employee.GetEmployeeRequest;
import io.grpc.Channel;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.concurrent.TimeUnit;

@Component
public class EmployeeGrpcClient {

    private final EmployeeServiceGrpc.EmployeeServiceBlockingStub stub;
    private final int deadlineSeconds;

    public EmployeeGrpcClient(
            @GrpcClient("employee-service") Channel channel,
            @Value("${app.grpc.employee.deadline-seconds:10}") int deadlineSeconds) {
        this.stub = EmployeeServiceGrpc.newBlockingStub(channel);
        this.deadlineSeconds = deadlineSeconds;
    }

    public EmployeeResponse getEmployee(String tenantId, String employeeId) {
        return stub.withDeadlineAfter(deadlineSeconds, TimeUnit.SECONDS)
                .getEmployee(GetEmployeeRequest.newBuilder()
                        .setTenantId(tenantId)
                        .setEmployeeId(employeeId)
                        .build());
    }
}
