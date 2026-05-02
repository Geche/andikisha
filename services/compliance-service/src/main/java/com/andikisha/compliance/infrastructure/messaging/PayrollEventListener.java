package com.andikisha.compliance.infrastructure.messaging;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.compliance.application.service.ComplianceAuditService;
import com.andikisha.compliance.infrastructure.config.RabbitMqConfig;
import com.andikisha.events.payroll.PayrollProcessedEvent;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Listens for PayrollProcessedEvent and performs compliance audit checks.
 * <p>
 * Triggered after payroll-service finalises a payroll run. Compliance service
 * verifies that statutory deductions (SHIF, Housing Levy) are within KRA-mandated
 * limits for the given period and flags anomalies for HR.
 */
@Component
public class PayrollEventListener {

    private static final Logger log = LoggerFactory.getLogger(PayrollEventListener.class);

    private final ComplianceAuditService complianceAuditService;

    public PayrollEventListener(ComplianceAuditService complianceAuditService) {
        this.complianceAuditService = complianceAuditService;
    }

    @RabbitListener(queues = RabbitMqConfig.COMPLIANCE_PAYROLL_QUEUE)
    public void onPayrollProcessed(PayrollProcessedEvent event) {
        String tenantId = event.getTenantId();
        if (tenantId == null || tenantId.isBlank()) {
            log.error("Received PayrollProcessedEvent with missing tenantId — discarding. eventId={}",
                    event.getEventId());
            return; // ACKed and discarded — malformed events are not re-queued or dead-lettered
        }
        try {
            TenantContext.setTenantId(tenantId);
            log.info("Compliance audit triggered for payrollRunId={} period={} tenant={}",
                    event.getPayrollRunId(), event.getPeriod(), tenantId);

            List<String> anomalies = complianceAuditService.auditPayrollRun(
                    tenantId, event.getPayrollRunId(), event.getPeriod());

            if (!anomalies.isEmpty()) {
                log.warn("COMPLIANCE_AUDIT_FAILED payrollRunId={} anomalyCount={} anomalies={}",
                        event.getPayrollRunId(), anomalies.size(), anomalies);
            }
        } catch (Exception e) {
            log.error("Compliance audit failed for payrollRunId={} tenant={}",
                    event.getPayrollRunId(), event.getTenantId(), e);
            throw e; // re-throw to trigger RabbitMQ dead-letter routing
        } finally {
            TenantContext.clear();
        }
    }
}
