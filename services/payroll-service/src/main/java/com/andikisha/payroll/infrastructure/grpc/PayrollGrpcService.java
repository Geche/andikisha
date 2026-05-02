package com.andikisha.payroll.infrastructure.grpc;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.payroll.domain.model.PaySlip;
import com.andikisha.payroll.domain.model.PayrollRun;
import com.andikisha.payroll.domain.repository.PaySlipRepository;
import com.andikisha.payroll.domain.repository.PayrollRunRepository;
import com.andikisha.proto.payroll.GetLatestPaySlipRequest;
import com.andikisha.proto.payroll.GetPaySlipRequest;
import com.andikisha.proto.payroll.GetPaySlipsRequest;
import com.andikisha.proto.payroll.GetPaySlipsResponse;
import com.andikisha.proto.payroll.GetPayrollRunRequest;
import com.andikisha.proto.payroll.PaySlipDetail;
import com.andikisha.proto.payroll.PaySlipResponse;
import com.andikisha.proto.payroll.PayrollRunResponse;
import com.andikisha.proto.payroll.PayrollServiceGrpc;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@GrpcService
@Transactional(readOnly = true)
public class PayrollGrpcService extends PayrollServiceGrpc.PayrollServiceImplBase {

    private static final Logger log = LoggerFactory.getLogger(PayrollGrpcService.class);

    private static final String ZERO = "0.00";
    private static final String EMPTY = "";

    private final PayrollRunRepository payrollRunRepository;
    private final PaySlipRepository paySlipRepository;

    public PayrollGrpcService(PayrollRunRepository payrollRunRepository,
                              PaySlipRepository paySlipRepository) {
        this.payrollRunRepository = payrollRunRepository;
        this.paySlipRepository = paySlipRepository;
    }

    @Override
    public void getPayrollRun(GetPayrollRunRequest request,
                              StreamObserver<PayrollRunResponse> responseObserver) {
        String tenantId = request.getTenantId();
        if (tenantId == null || tenantId.isBlank()) {
            responseObserver.onError(Status.INVALID_ARGUMENT
                    .withDescription("tenant_id is required").asRuntimeException());
            return;
        }
        try {
            TenantContext.setTenantId(tenantId);
            UUID id = UUID.fromString(request.getPayrollRunId());
            var maybeRun = payrollRunRepository.findByIdAndTenantId(id, tenantId);
            if (maybeRun.isEmpty()) {
                responseObserver.onError(Status.NOT_FOUND
                        .withDescription("PayrollRun not found: " + id)
                        .asRuntimeException());
                return;
            }
            responseObserver.onNext(toPayrollRunResponse(maybeRun.get()));
            responseObserver.onCompleted();
        } catch (IllegalArgumentException e) {
            responseObserver.onError(Status.INVALID_ARGUMENT
                    .withDescription("Invalid payroll_run_id: " + request.getPayrollRunId())
                    .asRuntimeException());
        } catch (Exception e) {
            log.error("getPayrollRun failed for {}", request.getPayrollRunId(), e);
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage()).asRuntimeException());
        } finally {
            TenantContext.clear();
        }
    }

    @Override
    public void getPaySlip(GetPaySlipRequest request,
                           StreamObserver<PaySlipResponse> responseObserver) {
        String tenantId = request.getTenantId();
        if (tenantId == null || tenantId.isBlank()) {
            responseObserver.onError(Status.INVALID_ARGUMENT
                    .withDescription("tenant_id is required").asRuntimeException());
            return;
        }
        try {
            TenantContext.setTenantId(tenantId);
            UUID id = UUID.fromString(request.getPaySlipId());
            var maybeSlip = paySlipRepository.findByIdAndTenantId(id, tenantId);
            if (maybeSlip.isEmpty()) {
                responseObserver.onError(Status.NOT_FOUND
                        .withDescription("PaySlip not found: " + id)
                        .asRuntimeException());
                return;
            }
            responseObserver.onNext(toPaySlipResponse(maybeSlip.get()));
            responseObserver.onCompleted();
        } catch (IllegalArgumentException e) {
            responseObserver.onError(Status.INVALID_ARGUMENT
                    .withDescription("Invalid pay_slip_id: " + request.getPaySlipId())
                    .asRuntimeException());
        } catch (Exception e) {
            log.error("getPaySlip failed for {}", request.getPaySlipId(), e);
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage()).asRuntimeException());
        } finally {
            TenantContext.clear();
        }
    }

    @Override
    public void getLatestPaySlip(GetLatestPaySlipRequest request,
                                 StreamObserver<PaySlipResponse> responseObserver) {
        String tenantId = request.getTenantId();
        if (tenantId == null || tenantId.isBlank()) {
            responseObserver.onError(Status.INVALID_ARGUMENT
                    .withDescription("tenant_id is required").asRuntimeException());
            return;
        }
        try {
            TenantContext.setTenantId(tenantId);
            UUID employeeId = UUID.fromString(request.getEmployeeId());
            var maybeSlip = paySlipRepository
                    .findFirstByEmployeeIdAndTenantIdOrderByCreatedAtDesc(employeeId, tenantId);
            if (maybeSlip.isEmpty()) {
                responseObserver.onError(Status.NOT_FOUND
                        .withDescription("No pay slips found for employee: " + employeeId)
                        .asRuntimeException());
                return;
            }
            responseObserver.onNext(toPaySlipResponse(maybeSlip.get()));
            responseObserver.onCompleted();
        } catch (IllegalArgumentException e) {
            responseObserver.onError(Status.INVALID_ARGUMENT
                    .withDescription("Invalid employee_id: " + request.getEmployeeId())
                    .asRuntimeException());
        } catch (Exception e) {
            log.error("getLatestPaySlip failed for employee {}", request.getEmployeeId(), e);
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage()).asRuntimeException());
        } finally {
            TenantContext.clear();
        }
    }

    @Override
    public void getPaySlips(GetPaySlipsRequest request,
                            StreamObserver<GetPaySlipsResponse> responseObserver) {
        String tenantId = request.getTenantId();
        if (tenantId == null || tenantId.isBlank()) {
            responseObserver.onError(Status.INVALID_ARGUMENT
                    .withDescription("tenant_id is required").asRuntimeException());
            return;
        }
        try {
            TenantContext.setTenantId(tenantId);
            UUID payrollRunId = UUID.fromString(request.getPayrollRunId());
            List<PaySlip> slips = paySlipRepository
                    .findByPayrollRunIdAndTenantId(payrollRunId, tenantId);
            List<PaySlipDetail> details = slips.stream()
                    .map(slip -> toPaySlipDetail(slip, request.getPayrollRunId()))
                    .toList();
            responseObserver.onNext(GetPaySlipsResponse.newBuilder()
                    .addAllPaySlips(details)
                    .build());
            responseObserver.onCompleted();
        } catch (IllegalArgumentException e) {
            responseObserver.onError(Status.INVALID_ARGUMENT
                    .withDescription("Invalid payroll_run_id: " + request.getPayrollRunId())
                    .asRuntimeException());
        } catch (Exception e) {
            log.error("getPaySlips failed for run {}", request.getPayrollRunId(), e);
            responseObserver.onError(Status.INTERNAL
                    .withDescription(e.getMessage()).asRuntimeException());
        } finally {
            TenantContext.clear();
        }
    }

    // ----------------------------------------------------------------------
    // Mapping helpers
    // ----------------------------------------------------------------------

    private PayrollRunResponse toPayrollRunResponse(PayrollRun run) {
        return PayrollRunResponse.newBuilder()
                .setId(run.getId().toString())
                .setTenantId(run.getTenantId())
                .setPeriod(run.getPeriod())
                .setStatus(run.getStatus().name())
                .setEmployeeCount(run.getEmployeeCount())
                .setTotalGross(plain(run.getTotalGross()))
                .setTotalNet(plain(run.getTotalNet()))
                .setTotalPaye(plain(run.getTotalPaye()))
                .setTotalNssf(plain(run.getTotalNssf()))
                .setTotalShif(plain(run.getTotalShif()))
                .setTotalHousingLevy(plain(run.getTotalHousingLevy()))
                .setCurrency(run.getCurrency() != null ? run.getCurrency() : "KES")
                .build();
    }

    private PaySlipResponse toPaySlipResponse(PaySlip slip) {
        // payrollRun is lazy; resolved inside the @Transactional class boundary.
        String payrollRunId = slip.getPayrollRun() != null
                ? slip.getPayrollRun().getId().toString()
                : EMPTY;
        String period = slip.getPayrollRun() != null
                ? slip.getPayrollRun().getPeriod()
                : EMPTY;

        return PaySlipResponse.newBuilder()
                .setId(slip.getId().toString())
                .setPayrollRunId(payrollRunId)
                .setTenantId(slip.getTenantId())
                .setEmployeeId(slip.getEmployeeId().toString())
                .setEmployeeName(slip.getEmployeeName())
                .setPeriod(period)
                .setGrossPay(plain(slip.getGrossPay()))
                .setTaxableIncome(EMPTY)
                .setBasicPay(plain(slip.getBasicPay()))
                .setHousingAllowance(plain(slip.getHousingAllowance()))
                .setOtherAllowances(plain(slip.getOtherAllowances()))
                .setPersonalRelief(plain(slip.getPersonalRelief()))
                .setInsuranceRelief(plain(slip.getInsuranceRelief()))
                .setPaye(plain(slip.getPaye()))
                .setKraPin(EMPTY)
                .setEmployeeNssf(plain(slip.getNssf()))
                .setEmployerNssf(plain(slip.getNssfEmployer()))
                .setNssfTier1(EMPTY)
                .setNssfTier2(EMPTY)
                .setShif(plain(slip.getShif()))
                .setHousingLevy(plain(slip.getHousingLevy()))
                .setHelb(slip.getHelb() != null ? slip.getHelb().toPlainString() : ZERO)
                .setLoanDeductions(EMPTY)
                .setOtherDeductions(plain(slip.getOtherDeductions()))
                .setTotalDeductions(plain(slip.getTotalDeductions()))
                .setNetPay(plain(slip.getNetPay()))
                .setCurrency(slip.getCurrency() != null ? slip.getCurrency() : "KES")
                .setPaymentStatus(slip.getPaymentStatus().name())
                .setMpesaReceipt(slip.getMpesaReceipt() != null ? slip.getMpesaReceipt() : EMPTY)
                .setBankName(EMPTY)
                .setBankAccount(EMPTY)
                .setBankTransactionId(EMPTY)
                .setPaymentMethod(EMPTY)
                .setPaymentDate(EMPTY)
                .setPaymentReference(EMPTY)
                .setCreatedAt(slip.getCreatedAt() != null ? slip.getCreatedAt().toString() : EMPTY)
                .setApproverId(EMPTY)
                .setApproverName(EMPTY)
                .setRemarks(EMPTY)
                .build();
    }

    private PaySlipDetail toPaySlipDetail(PaySlip slip, String payrollRunId) {
        String period = slip.getPayrollRun() != null ? slip.getPayrollRun().getPeriod() : EMPTY;

        return PaySlipDetail.newBuilder()
                .setEmployeeId(slip.getEmployeeId().toString())
                .setEmployeeName(slip.getEmployeeName())
                .setEmployeeNumber(slip.getEmployeeNumber())
                .setPayrollRunId(payrollRunId)
                .setPeriod(period)
                .setGrossPay(plain(slip.getGrossPay()))
                .setNetPay(plain(slip.getNetPay()))
                .setBasicPay(plain(slip.getBasicPay()))
                .setHousingAllowance(plain(slip.getHousingAllowance()))
                .setTransportAllowance(plain(slip.getTransportAllowance()))
                .setMedicalAllowance(plain(slip.getMedicalAllowance()))
                .setOtherAllowances(plain(slip.getOtherAllowances()))
                .setPaye(plain(slip.getPaye()))
                .setNssf(plain(slip.getNssf()))
                .setShif(plain(slip.getShif()))
                .setHousingLevy(plain(slip.getHousingLevy()))
                .setHelb(slip.getHelb() != null ? slip.getHelb().toPlainString() : ZERO)
                .setPersonalRelief(plain(slip.getPersonalRelief()))
                .setInsuranceRelief(plain(slip.getInsuranceRelief()))
                .build();
    }

    /** Null-safe BigDecimal -> proto string. Falls back to "0.00". */
    private static String plain(BigDecimal value) {
        return value != null ? value.toPlainString() : ZERO;
    }
}
