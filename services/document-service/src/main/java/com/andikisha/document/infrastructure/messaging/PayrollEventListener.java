package com.andikisha.document.infrastructure.messaging;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.document.application.service.PayslipGenerator;
import com.andikisha.document.infrastructure.grpc.PayrollGrpcClient;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.payroll.PayrollProcessedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

@Component
public class PayrollEventListener {

    private static final Logger log = LoggerFactory.getLogger(PayrollEventListener.class);

    private final PayslipGenerator payslipGenerator;
    private final PayrollGrpcClient payrollClient;

    public PayrollEventListener(PayslipGenerator payslipGenerator,
                                PayrollGrpcClient payrollClient) {
        this.payslipGenerator = payslipGenerator;
        this.payrollClient = payrollClient;
    }

    @RabbitListener(queues = "document.payroll-events")
    public void handle(BaseEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            if (event instanceof PayrollProcessedEvent e) {
                dispatchPayslipGeneration(e);
            }
        } finally {
            TenantContext.clear();
        }
    }

    private void dispatchPayslipGeneration(PayrollProcessedEvent event) {
        log.info("Dispatching payslip generation for payroll run {} period {}",
                event.getPayrollRunId(), event.getPeriod());

        try {
            var payslips = payrollClient.getPaySlipsForRun(
                    event.getTenantId(), event.getPayrollRunId());

            for (var slip : payslips) {
                Map<String, BigDecimal> earnings   = buildEarnings(slip);
                Map<String, BigDecimal> deductions = buildDeductions(slip);
                Map<String, BigDecimal> reliefs    = buildReliefs(slip);

                payslipGenerator.generateAsync(
                        event.getTenantId(),
                        UUID.fromString(event.getPayrollRunId()),
                        UUID.fromString(slip.getEmployeeId()),
                        slip.getEmployeeName(),
                        slip.getEmployeeNumber(),
                        event.getPeriod(),
                        earnings, deductions, reliefs,
                        toBigDecimal(slip.getGrossPay()),
                        toBigDecimal(slip.getNetPay())
                );
            }

            log.info("Dispatched {} payslip generation tasks for period {}",
                    payslips.size(), event.getPeriod());

        } catch (Exception e) {
            log.error("Failed to dispatch payslip generation for payroll run {}: {}",
                    event.getPayrollRunId(), e.getMessage(), e);
            throw new RuntimeException(e);
        }
    }

    private Map<String, BigDecimal> buildEarnings(com.andikisha.proto.payroll.PaySlipDetail slip) {
        Map<String, BigDecimal> m = new LinkedHashMap<>();
        m.put("Basic Salary", toBigDecimal(slip.getBasicPay()));
        if (isPositive(slip.getHousingAllowance()))   m.put("Housing Allowance",   toBigDecimal(slip.getHousingAllowance()));
        if (isPositive(slip.getTransportAllowance())) m.put("Transport Allowance", toBigDecimal(slip.getTransportAllowance()));
        if (isPositive(slip.getMedicalAllowance()))   m.put("Medical Allowance",   toBigDecimal(slip.getMedicalAllowance()));
        if (isPositive(slip.getOtherAllowances()))    m.put("Other Allowances",    toBigDecimal(slip.getOtherAllowances()));
        return m;
    }

    private Map<String, BigDecimal> buildDeductions(com.andikisha.proto.payroll.PaySlipDetail slip) {
        Map<String, BigDecimal> m = new LinkedHashMap<>();
        m.put("PAYE",            toBigDecimal(slip.getPaye()));
        m.put("NSSF (Employee)", toBigDecimal(slip.getNssf()));
        m.put("SHIF",            toBigDecimal(slip.getShif()));
        m.put("Housing Levy",    toBigDecimal(slip.getHousingLevy()));
        if (isPositive(slip.getHelb())) m.put("HELB", toBigDecimal(slip.getHelb()));
        return m;
    }

    private Map<String, BigDecimal> buildReliefs(com.andikisha.proto.payroll.PaySlipDetail slip) {
        Map<String, BigDecimal> m = new LinkedHashMap<>();
        m.put("Personal Relief", toBigDecimal(slip.getPersonalRelief()));
        if (isPositive(slip.getInsuranceRelief())) m.put("Insurance Relief", toBigDecimal(slip.getInsuranceRelief()));
        return m;
    }

    private static BigDecimal toBigDecimal(String value) {
        return (value == null || value.isBlank()) ? BigDecimal.ZERO : new BigDecimal(value);
    }

    private static boolean isPositive(String value) {
        if (value == null || value.isBlank()) return false;
        try {
            return new BigDecimal(value).compareTo(BigDecimal.ZERO) > 0;
        } catch (NumberFormatException e) {
            return false;
        }
    }
}
