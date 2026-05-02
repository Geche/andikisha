package com.andikisha.compliance.application.service;

import com.andikisha.compliance.domain.repository.StatutoryRateRepository;
import com.andikisha.proto.payroll.GetPaySlipsRequest;
import com.andikisha.proto.payroll.PaySlipDetail;
import com.andikisha.proto.payroll.PayrollServiceGrpc;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

@Service
public class ComplianceAuditService {

    private static final Logger log = LoggerFactory.getLogger(ComplianceAuditService.class);
    private static final BigDecimal SHIF_RATE    = new BigDecimal("0.0275");
    private static final BigDecimal HOUSING_RATE = new BigDecimal("0.015");
    private static final BigDecimal TOLERANCE    = new BigDecimal("1.00");

    private final StatutoryRateRepository statutoryRateRepository;

    @GrpcClient("payroll-service")
    private PayrollServiceGrpc.PayrollServiceBlockingStub payrollStub;

    public ComplianceAuditService(StatutoryRateRepository statutoryRateRepository) {
        this.statutoryRateRepository = statutoryRateRepository;
    }

    public List<String> auditPayrollRun(String tenantId, String payrollRunId, String period) {
        List<String> anomalies = new ArrayList<>();

        List<PaySlipDetail> payslips;
        try {
            var response = payrollStub.getPaySlips(GetPaySlipsRequest.newBuilder()
                    .setPayrollRunId(payrollRunId)
                    .setTenantId(tenantId)
                    .build());
            payslips = response.getPaySlipsList();
        } catch (Exception e) {
            log.error("Could not retrieve payslips for audit — payrollRunId={}: {}", payrollRunId, e.getMessage());
            return List.of("AUDIT_SKIPPED: Could not retrieve payslips from payroll-service — " + e.getMessage());
        }

        for (PaySlipDetail slip : payslips) {
            BigDecimal gross = new BigDecimal(slip.getGrossPay());

            // Verify SHIF: must equal gross * 2.75%
            BigDecimal expectedShif = gross.multiply(SHIF_RATE).setScale(2, RoundingMode.HALF_UP);
            BigDecimal actualShif   = new BigDecimal(slip.getShif());
            if (actualShif.subtract(expectedShif).abs().compareTo(TOLERANCE) > 0) {
                anomalies.add(String.format(
                        "SHIF_MISMATCH employeeId=%s gross=%.2f expected=%.2f actual=%.2f",
                        slip.getEmployeeId(), gross, expectedShif, actualShif));
            }

            // Verify Housing Levy: must equal gross * 1.5%
            BigDecimal expectedHousing = gross.multiply(HOUSING_RATE).setScale(2, RoundingMode.HALF_UP);
            BigDecimal actualHousing   = new BigDecimal(slip.getHousingLevy());
            if (actualHousing.subtract(expectedHousing).abs().compareTo(TOLERANCE) > 0) {
                anomalies.add(String.format(
                        "HOUSING_LEVY_MISMATCH employeeId=%s gross=%.2f expected=%.2f actual=%.2f",
                        slip.getEmployeeId(), gross, expectedHousing, actualHousing));
            }
        }

        if (anomalies.isEmpty()) {
            log.info("Compliance audit PASSED for payrollRunId={} period={} employees={}",
                    payrollRunId, period, payslips.size());
        } else {
            log.warn("Compliance audit found {} anomalies for payrollRunId={}", anomalies.size(), payrollRunId);
        }
        return anomalies;
    }
}
