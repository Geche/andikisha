package com.andikisha.events;

import com.andikisha.events.attendance.ClockInEvent;
import com.andikisha.events.attendance.ClockOutEvent;
import com.andikisha.events.auth.UserDeactivatedEvent;
import com.andikisha.events.auth.UserRegisteredEvent;
import com.andikisha.events.compliance.ComplianceRateChangedEvent;
import com.andikisha.events.document.DocumentGeneratedEvent;
import com.andikisha.events.document.DocumentReadyEvent;
import com.andikisha.events.employee.EmployeeCreatedEvent;
import com.andikisha.events.employee.EmployeeTerminatedEvent;
import com.andikisha.events.employee.EmployeeUpdatedEvent;
import com.andikisha.events.employee.SalaryChangedEvent;
import com.andikisha.events.leave.LeaveApprovedEvent;
import com.andikisha.events.leave.LeaveRejectedEvent;
import com.andikisha.events.leave.LeaveRequestedEvent;
import com.andikisha.events.leave.LeaveReversedEvent;
import com.andikisha.events.notification.NotificationSentEvent;
import com.andikisha.events.payroll.PaymentCompletedEvent;
import com.andikisha.events.payroll.PaymentFailedEvent;
import com.andikisha.events.payroll.PayrollApprovedEvent;
import com.andikisha.events.payroll.PayrollCalculatedEvent;
import com.andikisha.events.payroll.PayrollInitiatedEvent;
import com.andikisha.events.payroll.PayrollProcessedEvent;
import com.andikisha.events.tenant.TenantCreatedEvent;
import com.andikisha.events.tenant.TenantPlanChangedEvent;
import com.andikisha.events.tenant.TenantReactivatedEvent;
import com.andikisha.events.tenant.TenantSuspendedEvent;
import com.fasterxml.jackson.annotation.JsonAutoDetect;
import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, property = "@type")
@JsonSubTypes({
        @JsonSubTypes.Type(value = UserRegisteredEvent.class,       name = "UserRegistered"),
        @JsonSubTypes.Type(value = UserDeactivatedEvent.class,      name = "UserDeactivated"),
        @JsonSubTypes.Type(value = EmployeeCreatedEvent.class,      name = "EmployeeCreated"),
        @JsonSubTypes.Type(value = EmployeeUpdatedEvent.class,      name = "EmployeeUpdated"),
        @JsonSubTypes.Type(value = EmployeeTerminatedEvent.class,   name = "EmployeeTerminated"),
        @JsonSubTypes.Type(value = SalaryChangedEvent.class,        name = "SalaryChanged"),
        @JsonSubTypes.Type(value = TenantCreatedEvent.class,        name = "TenantCreated"),
        @JsonSubTypes.Type(value = TenantSuspendedEvent.class,      name = "TenantSuspended"),
        @JsonSubTypes.Type(value = TenantReactivatedEvent.class,    name = "TenantReactivated"),
        @JsonSubTypes.Type(value = TenantPlanChangedEvent.class,    name = "TenantPlanChanged"),
        @JsonSubTypes.Type(value = LeaveRequestedEvent.class,       name = "LeaveRequested"),
        @JsonSubTypes.Type(value = LeaveApprovedEvent.class,        name = "LeaveApproved"),
        @JsonSubTypes.Type(value = LeaveRejectedEvent.class,        name = "LeaveRejected"),
        @JsonSubTypes.Type(value = LeaveReversedEvent.class,        name = "LeaveReversed"),
        @JsonSubTypes.Type(value = PayrollInitiatedEvent.class,     name = "PayrollInitiated"),
        @JsonSubTypes.Type(value = PayrollCalculatedEvent.class,    name = "PayrollCalculated"),
        @JsonSubTypes.Type(value = PayrollApprovedEvent.class,      name = "PayrollApproved"),
        @JsonSubTypes.Type(value = PayrollProcessedEvent.class,     name = "PayrollProcessed"),
        @JsonSubTypes.Type(value = PaymentCompletedEvent.class,     name = "PaymentCompleted"),
        @JsonSubTypes.Type(value = PaymentFailedEvent.class,        name = "PaymentFailed"),
        @JsonSubTypes.Type(value = ComplianceRateChangedEvent.class, name = "ComplianceRateChanged"),
        @JsonSubTypes.Type(value = ClockInEvent.class,              name = "ClockIn"),
        @JsonSubTypes.Type(value = ClockOutEvent.class,             name = "ClockOut"),
        @JsonSubTypes.Type(value = NotificationSentEvent.class,     name = "NotificationSent"),
        @JsonSubTypes.Type(value = DocumentGeneratedEvent.class,    name = "DocumentGenerated"),
        @JsonSubTypes.Type(value = DocumentReadyEvent.class,        name = "DocumentReady"),
})
@JsonAutoDetect(fieldVisibility = JsonAutoDetect.Visibility.ANY)
public abstract class BaseEvent {

    private String eventId;
    private String eventType;
    private String tenantId;
    private Instant timestamp;

    protected BaseEvent(String eventType, String tenantId) {
        this.eventId = UUID.randomUUID().toString();
        this.eventType = eventType;
        this.tenantId = tenantId;
        this.timestamp = Instant.now();
    }

    protected BaseEvent() {}


    @Override
    public String toString() {
        return getClass().getSimpleName()
                + "{eventId=" + eventId
                + ", eventType=" + eventType
                + ", tenantId=" + tenantId
                + ", timestamp=" + timestamp + "}";
    }
}