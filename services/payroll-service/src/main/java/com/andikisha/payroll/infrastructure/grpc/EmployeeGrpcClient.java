package com.andikisha.payroll.infrastructure.grpc;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.proto.employee.EmployeeResponse;
import com.andikisha.proto.employee.EmployeeServiceGrpc;
import com.andikisha.proto.employee.GetSalaryRequest;
import com.andikisha.proto.employee.GetSalaryStructuresBatchRequest;
import com.andikisha.proto.employee.ListActiveByTenantRequest;
import com.andikisha.proto.employee.SalaryStructureResponse;
import io.grpc.Channel;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Component
public class EmployeeGrpcClient {

    private static final Logger log = LoggerFactory.getLogger(EmployeeGrpcClient.class);

    private final EmployeeServiceGrpc.EmployeeServiceBlockingStub stub;
    private final long deadlineSeconds;

    public EmployeeGrpcClient(
            @GrpcClient("employee-service") Channel channel,
            @Value("${app.grpc.deadline-seconds.employee-service:30}") long deadlineSeconds) {
        this.stub = EmployeeServiceGrpc.newBlockingStub(channel);
        this.deadlineSeconds = deadlineSeconds;
    }

    public List<EmployeeResponse> getActiveEmployees(String tenantId) {
        try {
            var response = stub.withDeadlineAfter(deadlineSeconds, TimeUnit.SECONDS)
                    .listActiveByTenant(
                            ListActiveByTenantRequest.newBuilder()
                                    .setTenantId(tenantId)
                                    .build());
            return response.getEmployeesList();
        } catch (StatusRuntimeException e) {
            if (e.getStatus().getCode() == Status.Code.DEADLINE_EXCEEDED) {
                log.error("employee-service.listActiveByTenant timed out after {}s for tenant {}",
                        deadlineSeconds, tenantId);
                throw new BusinessRuleException("UPSTREAM_TIMEOUT",
                        "Employee service did not respond in time. Please retry.");
            }
            throw e;
        }
    }

    public SalaryStructureResponse getSalaryStructure(String tenantId, String employeeId) {
        try {
            return stub.withDeadlineAfter(deadlineSeconds, TimeUnit.SECONDS)
                    .getSalaryStructure(
                            GetSalaryRequest.newBuilder()
                                    .setTenantId(tenantId)
                                    .setEmployeeId(employeeId)
                                    .build());
        } catch (StatusRuntimeException e) {
            if (e.getStatus().getCode() == Status.Code.DEADLINE_EXCEEDED) {
                log.error("employee-service.getSalaryStructure timed out after {}s for employee {}",
                        deadlineSeconds, employeeId);
                throw new BusinessRuleException("UPSTREAM_TIMEOUT",
                        "Employee service did not respond in time. Please retry.");
            }
            throw e;
        }
    }

    public List<SalaryStructureResponse> getSalaryStructuresBatch(String tenantId, List<String> employeeIds) {
        try {
            var response = stub.withDeadlineAfter(deadlineSeconds, TimeUnit.SECONDS)
                    .getSalaryStructuresBatch(
                            GetSalaryStructuresBatchRequest.newBuilder()
                                    .setTenantId(tenantId)
                                    .addAllEmployeeIds(employeeIds)
                                    .build());
            return response.getSalaryStructuresList();
        } catch (StatusRuntimeException e) {
            if (e.getStatus().getCode() == Status.Code.DEADLINE_EXCEEDED) {
                log.error("employee-service.getSalaryStructuresBatch timed out after {}s for {} employees",
                        deadlineSeconds, employeeIds.size());
                throw new BusinessRuleException("UPSTREAM_TIMEOUT",
                        "Employee service did not respond in time. Please retry.");
            }
            throw e;
        }
    }
}
