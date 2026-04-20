package com.andikisha.notification.application.listener;

import com.andikisha.common.tenant.TenantContext;
import com.andikisha.events.BaseEvent;
import com.andikisha.events.payroll.PayrollApprovedEvent;
import com.andikisha.events.payroll.PayrollProcessedEvent;
import com.andikisha.notification.application.service.NotificationService;
import com.andikisha.notification.domain.model.NotificationChannel;
import com.andikisha.notification.domain.model.NotificationPriority;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class PayrollEventListener {

    private static final Logger log = LoggerFactory.getLogger(PayrollEventListener.class);
    private final NotificationService notificationService;

    public PayrollEventListener(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @RabbitListener(queues = "notification.payroll-events")
    public void handle(BaseEvent event) {
        TenantContext.setTenantId(event.getTenantId());
        try {
            switch (event) {
                case PayrollApprovedEvent e -> handleApproved(e);
                case PayrollProcessedEvent e -> handleProcessed(e);
                default -> log.debug("Ignoring payroll event: {}", event.getEventType());
            }
        } finally {
            TenantContext.clear();
        }
    }

    private void handleApproved(PayrollApprovedEvent event) {
        String subject = "Payroll Approved for " + event.getPeriod();
        String body = "Payroll for period " + event.getPeriod()
                + " has been approved.\n\n"
                + "Employees: " + event.getEmployeeCount() + "\n"
                + "Total Net Pay: KES " + event.getTotalNet().toPlainString() + "\n\n"
                + "Payment processing will begin shortly.";

        // Notify the approver (confirmation)
        notificationService.sendNotification(
                event.getTenantId(),
                UUID.fromString(event.getApprovedBy()),
                null, null, null,
                NotificationChannel.IN_APP,
                "PAYROLL", subject, body,
                NotificationPriority.HIGH,
                event.getEventId(), event.getEventType()
        );

        log.info("Payroll approval notification sent for period {}", event.getPeriod());
    }

    private void handleProcessed(PayrollProcessedEvent event) {
        // Individual payslip notifications are sent per employee
        // by the Document Service after generating payslips.
        // Here we just log the completion.
        log.info("Payroll processed notification for period {}", event.getPeriod());
    }
}