package com.andikisha.compliance.application.service;

import com.andikisha.compliance.domain.repository.StatutoryRateRepository;
import com.andikisha.compliance.infrastructure.grpc.PayrollGrpcClient;
import com.andikisha.proto.payroll.PaySlipDetail;
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
    private final PayrollGrpcClient payrollGrpcClient;

    public ComplianceAuditService(StatutoryRateRepository statutoryRateRepository,
                                  PayrollGrpcClient payrollGrpcClient) {
        this.statutoryRateRepository = statutoryRateRepository;
        this.payrollGrpcClient = payrollGrpcClient;
    }

    public List<String> auditPayrollRun(String tenantId, String payrollRunId, String period) {
        List<String> anomalies = new ArrayList<>();

        List<PaySlipDetail> payslips;
        try {
            payslips = payrollGrpcClient.getPaySlips(tenantId, payrollRunId);
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
                        "SHIF_MISMATCH employeeId=%s gross=%s expected=%s actual=%s",
                        slip.getEmployeeId(), gross.toPlainString(), expectedShif.toPlainString(), actualShif.toPlainString()));
            }

            // Verify Housing Levy: must equal gross * 1.5%
            BigDecimal expectedHousing = gross.multiply(HOUSING_RATE).setScale(2, RoundingMode.HALF_UP);
            BigDecimal actualHousing   = new BigDecimal(slip.getHousingLevy());
            if (actualHousing.subtract(expectedHousing).abs().compareTo(TOLERANCE) > 0) {
                anomalies.add(String.format(
                        "HOUSING_LEVY_MISMATCH employeeId=%s gross=%s expected=%s actual=%s",
                        slip.getEmployeeId(), gross.toPlainString(), expectedHousing.toPlainString(), actualHousing.toPlainString()));
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
