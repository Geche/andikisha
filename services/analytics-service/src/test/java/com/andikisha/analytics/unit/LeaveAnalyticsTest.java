package com.andikisha.analytics.unit;

import com.andikisha.analytics.domain.model.LeaveAnalytics;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.assertj.core.api.Assertions.assertThat;

class LeaveAnalyticsTest {

    private static final String TENANT = "tenant-a";
    private static final String PERIOD = "2026-04";
    private static final String LEAVE_TYPE = "ANNUAL";

    @Test
    void create_initializesAllFieldsToZero() {
        LeaveAnalytics la = LeaveAnalytics.create(TENANT, PERIOD, LEAVE_TYPE);

        assertThat(la.getTenantId()).isEqualTo(TENANT);
        assertThat(la.getPeriod()).isEqualTo(PERIOD);
        assertThat(la.getLeaveType()).isEqualTo(LEAVE_TYPE);
        assertThat(la.getRequestsSubmitted()).isZero();
        assertThat(la.getRequestsApproved()).isZero();
        assertThat(la.getRequestsRejected()).isZero();
        assertThat(la.getTotalDaysTaken()).isEqualTo(BigDecimal.ZERO.setScale(1));
        assertThat(la.getUniqueEmployees()).isZero();
        assertThat(la.getAverageDaysPerRequest()).isEqualTo(BigDecimal.ZERO.setScale(1));
    }

    @Test
    void recordSubmission_incrementsSubmitted() {
        LeaveAnalytics la = LeaveAnalytics.create(TENANT, PERIOD, LEAVE_TYPE);
        la.recordSubmission();

        assertThat(la.getRequestsSubmitted()).isEqualTo(1);
    }

    @Test
    void recordApproval_incrementsApprovedAndAccumulatesDays() {
        LeaveAnalytics la = LeaveAnalytics.create(TENANT, PERIOD, LEAVE_TYPE);
        la.recordApproval(new BigDecimal("5.0"));
        la.recordApproval(new BigDecimal("3.0"));

        assertThat(la.getRequestsApproved()).isEqualTo(2);
        assertThat(la.getTotalDaysTaken()).isEqualTo(new BigDecimal("8.0"));
        assertThat(la.getAverageDaysPerRequest()).isEqualTo(new BigDecimal("4.0"));
    }

    @Test
    void recordRejection_incrementsRejected() {
        LeaveAnalytics la = LeaveAnalytics.create(TENANT, PERIOD, LEAVE_TYPE);
        la.recordRejection();

        assertThat(la.getRequestsRejected()).isEqualTo(1);
    }

    @Test
    void getApprovalRate_returnsCorrectPercentage() {
        LeaveAnalytics la = LeaveAnalytics.create(TENANT, PERIOD, LEAVE_TYPE);
        la.recordApproval(new BigDecimal("5.0"));
        la.recordApproval(new BigDecimal("3.0"));
        la.recordRejection();

        assertThat(la.getApprovalRate()).isCloseTo(new BigDecimal("66.67"), org.assertj.core.data.Offset.offset(new BigDecimal("0.01")));
    }

    @Test
    void getApprovalRate_withNoDecisions_returnsZero() {
        LeaveAnalytics la = LeaveAnalytics.create(TENANT, PERIOD, LEAVE_TYPE);

        assertThat(la.getApprovalRate()).isZero();
    }

    @Test
    void getApprovalRate_withAllApproved_returns100() {
        LeaveAnalytics la = LeaveAnalytics.create(TENANT, PERIOD, LEAVE_TYPE);
        la.recordApproval(new BigDecimal("2.0"));

        assertThat(la.getApprovalRate()).isEqualByComparingTo(new BigDecimal("100.00"));
    }

    @Test
    void setUniqueEmployees_updatesCount() {
        LeaveAnalytics la = LeaveAnalytics.create(TENANT, PERIOD, LEAVE_TYPE);
        la.setUniqueEmployees(5);

        assertThat(la.getUniqueEmployees()).isEqualTo(5);
    }

    @Test
    void recordApproval_withZeroDays_recalculatesAverage() {
        LeaveAnalytics la = LeaveAnalytics.create(TENANT, PERIOD, LEAVE_TYPE);
        la.recordApproval(BigDecimal.ZERO);

        assertThat(la.getAverageDaysPerRequest()).isEqualTo(BigDecimal.ZERO.setScale(1));
    }
}
