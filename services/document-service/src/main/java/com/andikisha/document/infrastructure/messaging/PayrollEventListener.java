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

    /**
     * Fetches the payslip details via gRPC then fires one async task per employee.
     * The listener thread returns immediately after dispatching; each payslip is
     * generated concurrently on the documentTaskExecutor thread pool.
     */
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
                        BigDecimal.valueOf(slip.getGrossPay()),
                        BigDecimal.valueOf(slip.getNetPay())
                );
            }

            log.info("Dispatched {} payslip generation tasks for period {}",
                    payslips.size(), event.getPeriod());

        } catch (Exception e) {
            log.error("Failed to dispatch payslip generation for payroll run {}: {}",
                    event.getPayrollRunId(), e.getMessage(), e);
            throw new RuntimeException(e); // re-throw so RabbitMQ routes to DLX
        }
    }

    private Map<String, BigDecimal> buildEarnings(com.andikisha.proto.payroll.PaySlipDetail slip) {
        Map<String, BigDecimal> m = new LinkedHashMap<>();
        m.put("Basic Salary", BigDecimal.valueOf(slip.getBasicPay()));
        if (slip.getHousingAllowance()   > 0) m.put("Housing Allowance",   BigDecimal.valueOf(slip.getHousingAllowance()));
        if (slip.getTransportAllowance() > 0) m.put("Transport Allowance", BigDecimal.valueOf(slip.getTransportAllowance()));
        if (slip.getMedicalAllowance()   > 0) m.put("Medical Allowance",   BigDecimal.valueOf(slip.getMedicalAllowance()));
        if (slip.getOtherAllowances()    > 0) m.put("Other Allowances",    BigDecimal.valueOf(slip.getOtherAllowances()));
        return m;
    }

    private Map<String, BigDecimal> buildDeductions(com.andikisha.proto.payroll.PaySlipDetail slip) {
        Map<String, BigDecimal> m = new LinkedHashMap<>();
        m.put("PAYE",           BigDecimal.valueOf(slip.getPaye()));
        m.put("NSSF (Employee)", BigDecimal.valueOf(slip.getNssf()));
        m.put("SHIF",           BigDecimal.valueOf(slip.getShif()));
        m.put("Housing Levy",   BigDecimal.valueOf(slip.getHousingLevy()));
        if (slip.getHelb() > 0) m.put("HELB", BigDecimal.valueOf(slip.getHelb()));
        return m;
    }

    private Map<String, BigDecimal> buildReliefs(com.andikisha.proto.payroll.PaySlipDetail slip) {
        Map<String, BigDecimal> m = new LinkedHashMap<>();
        m.put("Personal Relief", BigDecimal.valueOf(slip.getPersonalRelief()));
        if (slip.getInsuranceRelief() > 0) m.put("Insurance Relief", BigDecimal.valueOf(slip.getInsuranceRelief()));
        return m;
    }
}
