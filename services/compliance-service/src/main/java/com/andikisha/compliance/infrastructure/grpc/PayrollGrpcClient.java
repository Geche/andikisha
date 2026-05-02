package com.andikisha.compliance.infrastructure.grpc;

import com.andikisha.proto.payroll.GetPaySlipsRequest;
import com.andikisha.proto.payroll.PaySlipDetail;
import com.andikisha.proto.payroll.PayrollServiceGrpc;
import io.grpc.Channel;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Component
public class PayrollGrpcClient {

    private final PayrollServiceGrpc.PayrollServiceBlockingStub stub;
    private final int deadlineSeconds;

    public PayrollGrpcClient(
            @GrpcClient("payroll-service") Channel channel,
            @Value("${app.grpc.payroll.deadline-seconds:10}") int deadlineSeconds) {
        this.stub = PayrollServiceGrpc.newBlockingStub(channel);
        this.deadlineSeconds = deadlineSeconds;
    }

    public List<PaySlipDetail> getPaySlips(String tenantId, String payrollRunId) {
        var response = stub.withDeadlineAfter(deadlineSeconds, TimeUnit.SECONDS)
                .getPaySlips(GetPaySlipsRequest.newBuilder()
                        .setTenantId(tenantId)
                        .setPayrollRunId(payrollRunId)
                        .build());
        return response.getPaySlipsList();
    }
}
