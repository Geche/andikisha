package com.andikisha.payroll.infrastructure.grpc;

import com.andikisha.proto.employee.EmployeeResponse;
import com.andikisha.proto.employee.EmployeeServiceGrpc;
import com.andikisha.proto.employee.GetSalaryRequest;
import com.andikisha.proto.employee.GetSalaryStructuresBatchRequest;
import com.andikisha.proto.employee.ListActiveByTenantRequest;
import com.andikisha.proto.employee.SalaryStructureResponse;
import io.grpc.Channel;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EmployeeGrpcClient {

    private final EmployeeServiceGrpc.EmployeeServiceBlockingStub stub;

//    @SuppressWarnings("SpringJavaInjectionPointsAutowiringInspection")
    public EmployeeGrpcClient(@GrpcClient("employee-service") Channel channel) {
        this.stub = EmployeeServiceGrpc.newBlockingStub(channel);
    }

    public List<EmployeeResponse> getActiveEmployees(String tenantId) {
        var response = stub.listActiveByTenant(
                ListActiveByTenantRequest.newBuilder()
                        .setTenantId(tenantId)
                        .build());
        return response.getEmployeesList();
    }

    public SalaryStructureResponse getSalaryStructure(String tenantId, String employeeId) {
        return stub.getSalaryStructure(
                GetSalaryRequest.newBuilder()
                        .setTenantId(tenantId)
                        .setEmployeeId(employeeId)
                        .build());
    }

    public List<SalaryStructureResponse> getSalaryStructuresBatch(String tenantId, List<String> employeeIds) {
        var response = stub.getSalaryStructuresBatch(
                GetSalaryStructuresBatchRequest.newBuilder()
                        .setTenantId(tenantId)
                        .addAllEmployeeIds(employeeIds)
                        .build());
        return response.getSalaryStructuresList();
    }
}
