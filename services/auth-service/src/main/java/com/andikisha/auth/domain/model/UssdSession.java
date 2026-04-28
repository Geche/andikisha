package com.andikisha.auth.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "ussd_session")
public class UssdSession extends BaseEntity {

    @Column(name = "employee_id")
    private String employeeId;

    @Column(name = "pin", nullable = false)
    private String pin;

    @Column(name = "msisdn", nullable = false, length = 20)
    private String msisdn;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "used", nullable = false)
    private boolean used = false;

    protected UssdSession() {}

    public static UssdSession create(String tenantId, String employeeId, String hashedPin,
                                     String msisdn, LocalDateTime expiresAt) {
        UssdSession session = new UssdSession();
        session.setTenantId(tenantId);
        session.employeeId = employeeId;
        session.pin = hashedPin;
        session.msisdn = msisdn;
        session.expiresAt = expiresAt;
        session.used = false;
        return session;
    }

    public void markUsed() {
        this.used = true;
    }

    public String getEmployeeId() { return employeeId; }
    public String getPin() { return pin; }
    public String getMsisdn() { return msisdn; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public boolean isUsed() { return used; }
}
