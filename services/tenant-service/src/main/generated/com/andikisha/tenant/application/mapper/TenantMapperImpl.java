package com.andikisha.tenant.application.mapper;

import com.andikisha.common.domain.Money;
import com.andikisha.tenant.application.dto.response.FeatureFlagResponse;
import com.andikisha.tenant.application.dto.response.PlanResponse;
import com.andikisha.tenant.application.dto.response.TenantResponse;
import com.andikisha.tenant.domain.model.FeatureFlag;
import com.andikisha.tenant.domain.model.Plan;
import com.andikisha.tenant.domain.model.Tenant;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-03T01:54:50+0300",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.11 (Amazon.com Inc.)"
)
@Component
public class TenantMapperImpl implements TenantMapper {

    @Override
    public TenantResponse toResponse(Tenant tenant) {
        if ( tenant == null ) {
            return null;
        }

        String planName = null;
        UUID id = null;
        String companyName = null;
        String country = null;
        String currency = null;
        String kraPin = null;
        String nssfNumber = null;
        String shifNumber = null;
        String adminEmail = null;
        String adminPhone = null;
        LocalDate trialEndsAt = null;
        String payFrequency = null;
        int payDay = 0;
        LocalDateTime createdAt = null;

        planName = tenantPlanName( tenant );
        id = tenant.getId();
        companyName = tenant.getCompanyName();
        country = tenant.getCountry();
        currency = tenant.getCurrency();
        kraPin = tenant.getKraPin();
        nssfNumber = tenant.getNssfNumber();
        shifNumber = tenant.getShifNumber();
        adminEmail = tenant.getAdminEmail();
        adminPhone = tenant.getAdminPhone();
        trialEndsAt = tenant.getTrialEndsAt();
        payFrequency = tenant.getPayFrequency();
        payDay = tenant.getPayDay();
        createdAt = tenant.getCreatedAt();

        String status = tenant.getStatus().name();
        String planTier = tenant.getPlan().getTier().name();

        TenantResponse tenantResponse = new TenantResponse( id, companyName, country, currency, kraPin, nssfNumber, shifNumber, adminEmail, adminPhone, status, planName, planTier, trialEndsAt, payFrequency, payDay, createdAt );

        return tenantResponse;
    }

    @Override
    public PlanResponse toResponse(Plan plan) {
        if ( plan == null ) {
            return null;
        }

        BigDecimal monthlyPrice = null;
        String currency = null;
        UUID id = null;
        String name = null;
        int maxEmployees = 0;
        int maxAdmins = 0;
        boolean payrollEnabled = false;
        boolean leaveEnabled = false;
        boolean attendanceEnabled = false;
        boolean documentsEnabled = false;
        boolean analyticsEnabled = false;

        monthlyPrice = planMonthlyPriceAmount( plan );
        currency = planMonthlyPriceCurrency( plan );
        id = plan.getId();
        name = plan.getName();
        maxEmployees = plan.getMaxEmployees();
        maxAdmins = plan.getMaxAdmins();
        payrollEnabled = plan.isPayrollEnabled();
        leaveEnabled = plan.isLeaveEnabled();
        attendanceEnabled = plan.isAttendanceEnabled();
        documentsEnabled = plan.isDocumentsEnabled();
        analyticsEnabled = plan.isAnalyticsEnabled();

        String tier = plan.getTier().name();

        PlanResponse planResponse = new PlanResponse( id, name, tier, monthlyPrice, currency, maxEmployees, maxAdmins, payrollEnabled, leaveEnabled, attendanceEnabled, documentsEnabled, analyticsEnabled );

        return planResponse;
    }

    @Override
    public FeatureFlagResponse toResponse(FeatureFlag flag) {
        if ( flag == null ) {
            return null;
        }

        String featureKey = null;
        boolean enabled = false;
        String description = null;

        featureKey = flag.getFeatureKey();
        enabled = flag.isEnabled();
        description = flag.getDescription();

        FeatureFlagResponse featureFlagResponse = new FeatureFlagResponse( featureKey, enabled, description );

        return featureFlagResponse;
    }

    private String tenantPlanName(Tenant tenant) {
        Plan plan = tenant.getPlan();
        if ( plan == null ) {
            return null;
        }
        return plan.getName();
    }

    private BigDecimal planMonthlyPriceAmount(Plan plan) {
        Money monthlyPrice = plan.getMonthlyPrice();
        if ( monthlyPrice == null ) {
            return null;
        }
        return monthlyPrice.getAmount();
    }

    private String planMonthlyPriceCurrency(Plan plan) {
        Money monthlyPrice = plan.getMonthlyPrice();
        if ( monthlyPrice == null ) {
            return null;
        }
        return monthlyPrice.getCurrency();
    }
}
