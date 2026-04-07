package com.andikisha.tenant.domain.model;

import com.andikisha.common.domain.BaseEntity;
import com.andikisha.common.exception.BusinessRuleException;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "tenants")
public class Tenant extends BaseEntity {

    @Column(nullable = false, length = 200)
    private String companyName;

    @Column(nullable = false, length = 5)
    private String country;

    @Column(nullable = false, length = 3)
    private String currency;

    @Column(name = "kra_pin", length = 20)
    private String kraPin;

    @Column(name = "nssf_number", length = 20)
    private String nssfNumber;

    @Column(name = "shif_number", length = 20)
    private String shifNumber;

    @Column(name = "admin_email", nullable = false)
    private String adminEmail;

    @Column(name = "admin_phone", nullable = false, length = 20)
    private String adminPhone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TenantStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plan_id", nullable = false)
    private Plan plan;

    @Column(name = "trial_ends_at")
    private LocalDate trialEndsAt;

    @Column(name = "pay_frequency", nullable = false, length = 20)
    private String payFrequency = "MONTHLY";

    @Column(name = "pay_day", nullable = false)
    private int payDay = 28;

    @Column(name = "suspension_reason", length = 500)
    private String suspensionReason;

    protected Tenant() {}

    public static Tenant create(String companyName, String country,
                                String currency, String adminEmail,
                                String adminPhone, Plan plan) {
        UUID id = UUID.randomUUID();
        Tenant tenant = new Tenant();
        tenant.setId(id);
        tenant.setTenantId(id.toString());
        tenant.companyName = companyName;
        tenant.country = country.toUpperCase();
        tenant.currency = currency.toUpperCase();
        tenant.adminEmail = adminEmail.toLowerCase().trim();
        tenant.adminPhone = adminPhone;
        tenant.plan = plan;
        tenant.status = TenantStatus.TRIAL;
        tenant.trialEndsAt = LocalDate.now().plusDays(14);
        tenant.payFrequency = "MONTHLY";
        tenant.payDay = 28;
        return tenant;
    }

    public void activate() {
        this.status = TenantStatus.ACTIVE;
    }

    public void suspend(String reason) {
        if (this.status == TenantStatus.CANCELLED) {
            throw new BusinessRuleException("INVALID_STATE", "Cannot suspend a cancelled tenant");
        }
        if (this.status == TenantStatus.SUSPENDED) {
            throw new BusinessRuleException("INVALID_STATE", "Tenant is already suspended");
        }
        this.status = TenantStatus.SUSPENDED;
        this.suspensionReason = reason;
    }

    public void cancel() {
        this.status = TenantStatus.CANCELLED;
    }

    public void reactivate() {
        if (this.status != TenantStatus.SUSPENDED) {
            throw new BusinessRuleException("INVALID_STATE",
                    "Can only reactivate a suspended tenant");
        }
        this.status = TenantStatus.ACTIVE;
        this.suspensionReason = null;
    }

    public void changePlan(Plan newPlan) {
        if (this.status == TenantStatus.CANCELLED) {
            throw new BusinessRuleException("INVALID_STATE",
                    "Cannot change plan for a cancelled tenant");
        }
        this.plan = newPlan;
    }

    public void updateCompanyName(String companyName) {
        if (companyName == null || companyName.isBlank()) {
            throw new BusinessRuleException("INVALID_COMPANY_NAME", "Company name cannot be blank");
        }
        this.companyName = companyName.trim();
    }

    public void updateStatutoryRegistrations(String kraPin,
                                             String nssfNumber,
                                             String shifNumber) {
        this.kraPin = kraPin;
        this.nssfNumber = nssfNumber;
        this.shifNumber = shifNumber;
    }

    public void updatePaySchedule(String payFrequency, int payDay) {
        if (payDay < 1 || payDay > 28) {
            throw new BusinessRuleException("Pay day must be between 1 and 28");
        }
        this.payFrequency = payFrequency;
        this.payDay = payDay;
    }

    public boolean isTrialExpired() {
        return status == TenantStatus.TRIAL
                && trialEndsAt != null
                && LocalDate.now().isAfter(trialEndsAt);
    }

    public String getCompanyName() { return companyName; }
    public String getCountry() { return country; }
    public String getCurrency() { return currency; }
    public String getKraPin() { return kraPin; }
    public String getNssfNumber() { return nssfNumber; }
    public String getShifNumber() { return shifNumber; }
    public String getAdminEmail() { return adminEmail; }
    public String getAdminPhone() { return adminPhone; }
    public TenantStatus getStatus() { return status; }
    public Plan getPlan() { return plan; }
    public LocalDate getTrialEndsAt() { return trialEndsAt; }
    public String getPayFrequency() { return payFrequency; }
    public int getPayDay() { return payDay; }
    public String getSuspensionReason() { return suspensionReason; }
}