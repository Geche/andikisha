package com.andikisha.compliance.unit;

import com.andikisha.compliance.application.service.ComplianceAuditService;
import com.andikisha.compliance.domain.repository.StatutoryRateRepository;
import com.andikisha.compliance.infrastructure.grpc.PayrollGrpcClient;
import com.andikisha.proto.payroll.PaySlipDetail;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ComplianceAuditServiceTest {

    @Mock StatutoryRateRepository statutoryRateRepository;
    @Mock PayrollGrpcClient payrollGrpcClient;

    private ComplianceAuditService service;

    @BeforeEach
    void setUp() {
        service = new ComplianceAuditService(statutoryRateRepository, payrollGrpcClient);
    }

    @Test
    void audit_correctDeductions_returnsEmptyList() {
        // SHIF = 80000 * 2.75% = 2200.00; Housing = 80000 * 1.5% = 1200.00
        PaySlipDetail slip = PaySlipDetail.newBuilder()
                .setEmployeeId("emp-1")
                .setGrossPay("80000.00")
                .setShif("2200.00")
                .setHousingLevy("1200.00")
                .build();

        when(payrollGrpcClient.getPaySlips(anyString(), anyString())).thenReturn(List.of(slip));

        List<String> result = service.auditPayrollRun("tenant-1", "run-1", "2026-04");
        assertThat(result).isEmpty();
    }

    @Test
    void audit_shifMismatch_returnsAnomaly() {
        // SHIF = 80000 * 2.75% = 2200.00; actual = 1500.00 (wrong — diff = 700 > tolerance 1.00)
        PaySlipDetail slip = PaySlipDetail.newBuilder()
                .setEmployeeId("emp-1")
                .setGrossPay("80000.00")
                .setShif("1500.00")
                .setHousingLevy("1200.00")
                .build();

        when(payrollGrpcClient.getPaySlips(anyString(), anyString())).thenReturn(List.of(slip));

        List<String> result = service.auditPayrollRun("tenant-1", "run-1", "2026-04");
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).contains("SHIF_MISMATCH");
    }

    @Test
    void audit_housingLevyMismatch_returnsAnomaly() {
        // Housing = 80000 * 1.5% = 1200.00; actual = 500.00 (wrong — diff = 700 > tolerance 1.00)
        PaySlipDetail slip = PaySlipDetail.newBuilder()
                .setEmployeeId("emp-2")
                .setGrossPay("80000.00")
                .setShif("2200.00")
                .setHousingLevy("500.00")
                .build();

        when(payrollGrpcClient.getPaySlips(anyString(), anyString())).thenReturn(List.of(slip));

        List<String> result = service.auditPayrollRun("tenant-1", "run-1", "2026-04");
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).contains("HOUSING_LEVY_MISMATCH");
    }

    @Test
    void audit_bothDeductionsMismatch_returnsTwoAnomalies() {
        PaySlipDetail slip = PaySlipDetail.newBuilder()
                .setEmployeeId("emp-3")
                .setGrossPay("100000.00")
                .setShif("100.00")   // expected 2750.00
                .setHousingLevy("50.00") // expected 1500.00
                .build();

        when(payrollGrpcClient.getPaySlips(anyString(), anyString())).thenReturn(List.of(slip));

        List<String> result = service.auditPayrollRun("tenant-1", "run-1", "2026-04");
        assertThat(result).hasSize(2);
        assertThat(result).anyMatch(s -> s.contains("SHIF_MISMATCH"));
        assertThat(result).anyMatch(s -> s.contains("HOUSING_LEVY_MISMATCH"));
    }

    @Test
    void audit_grpcFailure_returnsAuditSkipped() {
        when(payrollGrpcClient.getPaySlips(anyString(), anyString()))
                .thenThrow(new RuntimeException("Connection refused"));

        List<String> result = service.auditPayrollRun("tenant-1", "run-1", "2026-04");
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).startsWith("AUDIT_SKIPPED:");
    }

    @Test
    void audit_withinTolerance_returnsEmptyList() {
        // SHIF tolerance: 80000 * 2.75% = 2200.00; actual = 2200.50 (diff = 0.50 <= 1.00)
        // Housing tolerance: 80000 * 1.5% = 1200.00; actual = 1200.80 (diff = 0.80 <= 1.00)
        PaySlipDetail slip = PaySlipDetail.newBuilder()
                .setEmployeeId("emp-4")
                .setGrossPay("80000.00")
                .setShif("2200.50")
                .setHousingLevy("1200.80")
                .build();

        when(payrollGrpcClient.getPaySlips(anyString(), anyString())).thenReturn(List.of(slip));

        List<String> result = service.auditPayrollRun("tenant-1", "run-1", "2026-04");
        assertThat(result).isEmpty();
    }
}
