package com.andikisha.employee.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "employee_history")
@AttributeOverride(name = "createdAt", column = @Column(name = "changed_at", nullable = false, updatable = false))
public class EmployeeHistory extends BaseEntity {

    @Column(name = "employee_id", nullable = false)
    private UUID employeeId;

    @Column(name = "change_type", nullable = false, length = 50)
    private String changeType;

    @Column(name = "field_name", length = 100)
    private String fieldName;

    @Column(name = "old_value", length = 1000)
    private String oldValue;

    @Column(name = "new_value", length = 1000)
    private String newValue;

    @Column(name = "changed_by", nullable = false)
    private String changedBy;

    protected EmployeeHistory() {}

    public static EmployeeHistory record(String tenantId, UUID employeeId,
                                         String changeType, String fieldName,
                                         String oldValue, String newValue,
                                         String changedBy) {
        EmployeeHistory h = new EmployeeHistory();
        h.setTenantId(tenantId);
        h.employeeId = employeeId;
        h.changeType = changeType;
        h.fieldName = fieldName;
        h.oldValue = oldValue;
        h.newValue = newValue;
        h.changedBy = changedBy;
        return h;
    }

    public UUID getEmployeeId() { return employeeId; }
    public String getChangeType() { return changeType; }
    public String getFieldName() { return fieldName; }
    public String getOldValue() { return oldValue; }
    public String getNewValue() { return newValue; }
    public String getChangedBy() { return changedBy; }

    /** Alias for {@link #getCreatedAt()} — the timestamp when the change was recorded. */
    public LocalDateTime getChangedAt() { return getCreatedAt(); }
}
