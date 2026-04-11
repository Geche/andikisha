package com.andikisha.payroll.infrastructure.messaging;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.employee.EmployeeTerminatedEvent;
import com.andikisha.events.employee.SalaryChangedEvent;
import com.andikisha.payroll.domain.model.PayrollStatus;
import com.andikisha.payroll.domain.repository.PayrollRunRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class EmployeeEventListener {

    private static final Logger log = LoggerFactory.getLogger(EmployeeEventListener.class);

    /** Statuses that mean a payroll run is not yet approved and may still include the employee. */
    private static final List<PayrollStatus> ACTIVE_RUN_STATUSES =
            List.of(PayrollStatus.DRAFT, PayrollStatus.CALCULATING, PayrollStatus.CALCULATED);

    private final PayrollRunRepository payrollRunRepository;

    public EmployeeEventListener(PayrollRunRepository payrollRunRepository) {
        this.payrollRunRepository = payrollRunRepository;
    }

    @RabbitListener(queues = "payroll.employee-events")
    public void handleEmployeeEvent(BaseEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            switch (event) {
                case EmployeeTerminatedEvent e -> handleTermination(e);
                case SalaryChangedEvent e     -> handleSalaryChange(e);
                default -> log.debug("Ignoring employee event: {}", event.getEventType());
            }
        } finally {
            TenantContext.clear();
        }
    }

    /**
     * When an employee is terminated, check whether an open payroll run exists for that tenant.
     * If one does, the terminated employee may already be queued for a payslip — ops must review
     * the run before approving to ensure final pay is handled correctly (pro-ration, leave encashment, etc.).
     */
    private void handleTermination(EmployeeTerminatedEvent e) {
        boolean hasOpenRun = payrollRunRepository
                .existsByTenantIdAndStatusIn(e.getTenantId(), ACTIVE_RUN_STATUSES);

        if (hasOpenRun) {
            log.warn("PAYROLL ALERT [tenant={}]: Employee {} was terminated (reason: '{}', by: {}) " +
                     "while a payroll run is still open. Review and approve or cancel the run to ensure " +
                     "final pay is calculated correctly.",
                    e.getTenantId(), e.getEmployeeId(), e.getReason(), e.getTerminatedBy());
        } else {
            log.info("Employee {} terminated (tenant={}, reason: '{}'). No open payroll run — " +
                     "final pay will be handled in the next payroll cycle.",
                    e.getEmployeeId(), e.getTenantId(), e.getReason());
        }
    }

    /**
     * When an employee's salary changes, the new figures are fetched live from employee-service
     * via gRPC on each calculatePayroll call — there is no local cache to invalidate.
     * Log the change so the audit trail is visible in payroll service logs.
     */
    private void handleSalaryChange(SalaryChangedEvent e) {
        log.info("Salary updated for employee {} (tenant={}): {} → {} {}. " +
                 "Change will be reflected automatically in the next payroll run.",
                e.getEmployeeId(), e.getTenantId(),
                e.getOldSalary(), e.getNewSalary(), e.getCurrency());
    }
}
