package com.andikisha.payroll.unit;

import com.andikisha.payroll.domain.model.PaySlip;
import com.andikisha.payroll.domain.model.PaymentStatus;
import com.andikisha.payroll.domain.model.PayrollRun;
import com.andikisha.payroll.domain.model.PayrollStatus;
import com.andikisha.payroll.domain.repository.PaySlipRepository;
import com.andikisha.payroll.domain.repository.PayrollRunRepository;
import com.andikisha.payroll.infrastructure.grpc.PayrollGrpcService;
import com.andikisha.proto.payroll.GetPaySlipRequest;
import com.andikisha.proto.payroll.GetPaySlipsRequest;
import com.andikisha.proto.payroll.GetPaySlipsResponse;
import com.andikisha.proto.payroll.GetPayrollRunRequest;
import com.andikisha.proto.payroll.PaySlipResponse;
import com.andikisha.proto.payroll.PayrollRunResponse;
import io.grpc.StatusRuntimeException;
import io.grpc.stub.StreamObserver;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PayrollGrpcServiceTest {

    private static final String TENANT = "tenant-1";

    private PayrollRunRepository payrollRunRepository;
    private PaySlipRepository paySlipRepository;
    private PayrollGrpcService service;

    @BeforeEach
    void setUp() {
        payrollRunRepository = mock(PayrollRunRepository.class);
        paySlipRepository = mock(PaySlipRepository.class);
        service = new PayrollGrpcService(payrollRunRepository, paySlipRepository);
    }

    // -----------------------------------------------------------------
    // getPayrollRun
    // -----------------------------------------------------------------

    @Test
    void getPayrollRun_found() {
        UUID runId = UUID.randomUUID();
        PayrollRun run = stubRun(runId, "2026-05", PayrollStatus.CALCULATED, 5,
                new BigDecimal("500000.00"), new BigDecimal("400000.00"));

        when(payrollRunRepository.findByIdAndTenantId(runId, TENANT))
                .thenReturn(Optional.of(run));

        @SuppressWarnings("unchecked")
        StreamObserver<PayrollRunResponse> observer = mock(StreamObserver.class);

        service.getPayrollRun(GetPayrollRunRequest.newBuilder()
                .setTenantId(TENANT)
                .setPayrollRunId(runId.toString())
                .build(), observer);

        ArgumentCaptor<PayrollRunResponse> captor = ArgumentCaptor.forClass(PayrollRunResponse.class);
        verify(observer).onNext(captor.capture());
        verify(observer).onCompleted();
        verify(observer, never()).onError(any());

        PayrollRunResponse response = captor.getValue();
        assertThat(response.getId()).isEqualTo(runId.toString());
        assertThat(response.getTenantId()).isEqualTo(TENANT);
        assertThat(response.getPeriod()).isEqualTo("2026-05");
        assertThat(response.getStatus()).isEqualTo("CALCULATED");
        assertThat(response.getEmployeeCount()).isEqualTo(5);
        assertThat(response.getTotalGross()).isEqualTo("500000.00");
        assertThat(response.getTotalNet()).isEqualTo("400000.00");
        assertThat(response.getCurrency()).isEqualTo("KES");
    }

    @Test
    void getPayrollRun_notFound() {
        UUID runId = UUID.randomUUID();
        when(payrollRunRepository.findByIdAndTenantId(runId, TENANT))
                .thenReturn(Optional.empty());

        @SuppressWarnings("unchecked")
        StreamObserver<PayrollRunResponse> observer = mock(StreamObserver.class);

        service.getPayrollRun(GetPayrollRunRequest.newBuilder()
                .setTenantId(TENANT)
                .setPayrollRunId(runId.toString())
                .build(), observer);

        ArgumentCaptor<Throwable> err = ArgumentCaptor.forClass(Throwable.class);
        verify(observer).onError(err.capture());
        verify(observer, never()).onNext(any());
        verify(observer, never()).onCompleted();

        assertThat(err.getValue()).isInstanceOf(StatusRuntimeException.class);
        assertThat(err.getValue().getMessage()).contains("NOT_FOUND");
    }

    // -----------------------------------------------------------------
    // getPaySlip
    // -----------------------------------------------------------------

    @Test
    void getPaySlip_notFound() {
        UUID slipId = UUID.randomUUID();
        when(paySlipRepository.findByIdAndTenantId(slipId, TENANT))
                .thenReturn(Optional.empty());

        @SuppressWarnings("unchecked")
        StreamObserver<PaySlipResponse> observer = mock(StreamObserver.class);

        service.getPaySlip(GetPaySlipRequest.newBuilder()
                .setTenantId(TENANT)
                .setPaySlipId(slipId.toString())
                .build(), observer);

        ArgumentCaptor<Throwable> err = ArgumentCaptor.forClass(Throwable.class);
        verify(observer).onError(err.capture());
        verify(observer, never()).onNext(any());
        verify(observer, never()).onCompleted();

        assertThat(err.getValue()).isInstanceOf(StatusRuntimeException.class);
        assertThat(err.getValue().getMessage()).contains("NOT_FOUND");
    }

    // -----------------------------------------------------------------
    // getPaySlips
    // -----------------------------------------------------------------

    @Test
    void getPaySlips_returnsListOfDetails() {
        UUID runId = UUID.randomUUID();
        UUID employeeId = UUID.randomUUID();

        PayrollRun run = stubRun(runId, "2026-05", PayrollStatus.CALCULATED, 1,
                new BigDecimal("100000.00"), new BigDecimal("80000.00"));
        PaySlip slip = stubSlip(UUID.randomUUID(), employeeId, run);

        when(paySlipRepository.findByPayrollRunIdAndTenantId(runId, TENANT))
                .thenReturn(List.of(slip));

        @SuppressWarnings("unchecked")
        StreamObserver<GetPaySlipsResponse> observer = mock(StreamObserver.class);

        service.getPaySlips(GetPaySlipsRequest.newBuilder()
                .setTenantId(TENANT)
                .setPayrollRunId(runId.toString())
                .build(), observer);

        ArgumentCaptor<GetPaySlipsResponse> captor = ArgumentCaptor.forClass(GetPaySlipsResponse.class);
        verify(observer).onNext(captor.capture());
        verify(observer).onCompleted();
        verify(observer, never()).onError(any());

        GetPaySlipsResponse response = captor.getValue();
        assertThat(response.getPaySlipsList()).hasSize(1);
        assertThat(response.getPaySlips(0).getEmployeeId()).isEqualTo(employeeId.toString());
        assertThat(response.getPaySlips(0).getGrossPay()).isEqualTo("100000.00");
        assertThat(response.getPaySlips(0).getPeriod()).isEqualTo("2026-05");
        assertThat(response.getPaySlips(0).getPayrollRunId()).isEqualTo(runId.toString());
    }

    @Test
    void getPaySlips_emptyRun_returnsEmptyList() {
        UUID runId = UUID.randomUUID();

        when(paySlipRepository.findByPayrollRunIdAndTenantId(runId, TENANT))
                .thenReturn(List.of());

        @SuppressWarnings("unchecked")
        StreamObserver<GetPaySlipsResponse> observer = mock(StreamObserver.class);

        service.getPaySlips(GetPaySlipsRequest.newBuilder()
                .setTenantId(TENANT)
                .setPayrollRunId(runId.toString())
                .build(), observer);

        ArgumentCaptor<GetPaySlipsResponse> captor = ArgumentCaptor.forClass(GetPaySlipsResponse.class);
        verify(observer).onNext(captor.capture());
        verify(observer).onCompleted();
        verify(observer, never()).onError(any());

        assertThat(captor.getValue().getPaySlipsList()).isEmpty();
    }

    // -----------------------------------------------------------------
    // Stubs
    // -----------------------------------------------------------------

    private PayrollRun stubRun(UUID id, String period, PayrollStatus status,
                               int employeeCount, BigDecimal totalGross, BigDecimal totalNet) {
        PayrollRun run = mock(PayrollRun.class);
        when(run.getId()).thenReturn(id);
        when(run.getTenantId()).thenReturn(TENANT);
        when(run.getPeriod()).thenReturn(period);
        when(run.getStatus()).thenReturn(status);
        when(run.getEmployeeCount()).thenReturn(employeeCount);
        when(run.getTotalGross()).thenReturn(totalGross);
        when(run.getTotalNet()).thenReturn(totalNet);
        when(run.getTotalPaye()).thenReturn(new BigDecimal("50000.00"));
        when(run.getTotalNssf()).thenReturn(new BigDecimal("12000.00"));
        when(run.getTotalShif()).thenReturn(new BigDecimal("8000.00"));
        when(run.getTotalHousingLevy()).thenReturn(new BigDecimal("6000.00"));
        when(run.getCurrency()).thenReturn("KES");
        return run;
    }

    private PaySlip stubSlip(UUID id, UUID employeeId, PayrollRun run) {
        PaySlip slip = mock(PaySlip.class);
        when(slip.getId()).thenReturn(id);
        when(slip.getTenantId()).thenReturn(TENANT);
        when(slip.getEmployeeId()).thenReturn(employeeId);
        when(slip.getEmployeeNumber()).thenReturn("EMP-001");
        when(slip.getEmployeeName()).thenReturn("Jane Doe");
        when(slip.getPayrollRun()).thenReturn(run);
        when(slip.getBasicPay()).thenReturn(new BigDecimal("80000.00"));
        when(slip.getHousingAllowance()).thenReturn(new BigDecimal("10000.00"));
        when(slip.getTransportAllowance()).thenReturn(new BigDecimal("5000.00"));
        when(slip.getMedicalAllowance()).thenReturn(new BigDecimal("3000.00"));
        when(slip.getOtherAllowances()).thenReturn(new BigDecimal("2000.00"));
        when(slip.getTotalAllowances()).thenReturn(new BigDecimal("20000.00"));
        when(slip.getGrossPay()).thenReturn(new BigDecimal("100000.00"));
        when(slip.getPaye()).thenReturn(new BigDecimal("18000.00"));
        when(slip.getNssf()).thenReturn(new BigDecimal("2160.00"));
        when(slip.getNssfEmployer()).thenReturn(new BigDecimal("2160.00"));
        when(slip.getShif()).thenReturn(new BigDecimal("2750.00"));
        when(slip.getHousingLevy()).thenReturn(new BigDecimal("1500.00"));
        when(slip.getHousingLevyEmployer()).thenReturn(new BigDecimal("1500.00"));
        when(slip.getHelb()).thenReturn(new BigDecimal("0.00"));
        when(slip.getOtherDeductions()).thenReturn(new BigDecimal("0.00"));
        when(slip.getTotalDeductions()).thenReturn(new BigDecimal("24410.00"));
        when(slip.getPersonalRelief()).thenReturn(new BigDecimal("2400.00"));
        when(slip.getInsuranceRelief()).thenReturn(BigDecimal.ZERO);
        when(slip.getNetPay()).thenReturn(new BigDecimal("75590.00"));
        when(slip.getCurrency()).thenReturn("KES");
        when(slip.getPaymentStatus()).thenReturn(PaymentStatus.PENDING);
        when(slip.getMpesaReceipt()).thenReturn(null);
        when(slip.getCreatedAt()).thenReturn(LocalDateTime.of(2026, 5, 1, 12, 0));
        return slip;
    }
}
