package com.andikisha.leave.unit;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.leave.domain.model.LeaveRequest;
import com.andikisha.leave.domain.model.LeaveRequestStatus;
import com.andikisha.leave.domain.model.LeaveType;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class LeaveRequestDomainTest {

    private static final String TENANT_ID   = "tenant-1";
    private static final UUID   EMPLOYEE_ID = UUID.randomUUID();
    private static final UUID   REVIEWER_ID = UUID.randomUUID();

    private LeaveRequest pending;

    @BeforeEach
    void setUp() {
        pending = LeaveRequest.create(
                TENANT_ID, EMPLOYEE_ID, "Jane Doe", LeaveType.ANNUAL,
                LocalDate.now().plusDays(7), LocalDate.now().plusDays(11),
                BigDecimal.valueOf(5), "Family trip");
    }

    // ------------------------------------------------------------------
    // create factory
    // ------------------------------------------------------------------

    @Test
    void create_setsInitialStatusToPending() {
        assertThat(pending.getStatus()).isEqualTo(LeaveRequestStatus.PENDING);
    }

    @Test
    void create_startAfterEnd_throwsBusinessRule() {
        assertThatThrownBy(() -> LeaveRequest.create(
                TENANT_ID, EMPLOYEE_ID, "Jane", LeaveType.ANNUAL,
                LocalDate.now().plusDays(5), LocalDate.now().plusDays(3),
                BigDecimal.ONE, null))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Start date cannot be after end date");
    }

    @Test
    void create_zeroDays_throwsBusinessRule() {
        assertThatThrownBy(() -> LeaveRequest.create(
                TENANT_ID, EMPLOYEE_ID, "Jane", LeaveType.ANNUAL,
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(1),
                BigDecimal.ZERO, null))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("positive");
    }

    @Test
    void create_negativeDays_throwsBusinessRule() {
        assertThatThrownBy(() -> LeaveRequest.create(
                TENANT_ID, EMPLOYEE_ID, "Jane", LeaveType.ANNUAL,
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(3),
                BigDecimal.valueOf(-1), null))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("positive");
    }

    // ------------------------------------------------------------------
    // approve
    // ------------------------------------------------------------------

    @Test
    void approve_fromPending_transitionsToApproved() {
        pending.approve(REVIEWER_ID, "Manager");
        assertThat(pending.getStatus()).isEqualTo(LeaveRequestStatus.APPROVED);
        assertThat(pending.getReviewedBy()).isEqualTo(REVIEWER_ID);
        assertThat(pending.getReviewerName()).isEqualTo("Manager");
        assertThat(pending.getReviewedAt()).isNotNull();
    }

    @Test
    void approve_nonPending_throwsBusinessRule() {
        pending.approve(REVIEWER_ID, "Manager");
        assertThatThrownBy(() -> pending.approve(REVIEWER_ID, "Manager"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("PENDING");
    }

    // ------------------------------------------------------------------
    // reject
    // ------------------------------------------------------------------

    @Test
    void reject_fromPending_transitionsToRejected() {
        pending.reject(REVIEWER_ID, "Manager", "Not enough cover");
        assertThat(pending.getStatus()).isEqualTo(LeaveRequestStatus.REJECTED);
        assertThat(pending.getRejectionReason()).isEqualTo("Not enough cover");
    }

    @Test
    void reject_nonPending_throwsBusinessRule() {
        pending.reject(REVIEWER_ID, "Manager", "reason");
        assertThatThrownBy(() -> pending.reject(REVIEWER_ID, "Manager", "again"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("PENDING");
    }

    // ------------------------------------------------------------------
    // cancel
    // ------------------------------------------------------------------

    @Test
    void cancel_fromPending_transitionsToCancelled() {
        pending.cancel();
        assertThat(pending.getStatus()).isEqualTo(LeaveRequestStatus.CANCELLED);
    }

    @Test
    void cancel_whenApproved_throwsBusinessRule() {
        pending.approve(REVIEWER_ID, "Manager");
        assertThatThrownBy(() -> pending.cancel())
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("Contact HR");
    }

    @Test
    void cancel_whenRejected_throwsBusinessRule() {
        pending.reject(REVIEWER_ID, "Manager", "reason");
        assertThatThrownBy(() -> pending.cancel())
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("PENDING");
    }

    // ------------------------------------------------------------------
    // reverse (HR reversal)
    // ------------------------------------------------------------------

    @Test
    void reverse_fromApproved_transitionsToCancelled() {
        pending.approve(REVIEWER_ID, "Manager");
        pending.reverse(REVIEWER_ID, "HR Manager", "Employee resigned");

        assertThat(pending.getStatus()).isEqualTo(LeaveRequestStatus.CANCELLED);
        assertThat(pending.getRejectionReason()).isEqualTo("Employee resigned");
        assertThat(pending.getReviewedAt()).isNotNull();
    }

    @Test
    void reverse_nonApproved_throwsBusinessRule() {
        assertThatThrownBy(() -> pending.reverse(REVIEWER_ID, "HR", "reason"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("not APPROVED");
    }

    @Test
    void reverse_alreadyCancelled_throwsBusinessRule() {
        pending.cancel();
        assertThatThrownBy(() -> pending.reverse(REVIEWER_ID, "HR", "reason"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("not APPROVED");
    }

    // ------------------------------------------------------------------
    // attachMedicalCert
    // ------------------------------------------------------------------

    @Test
    void attachMedicalCert_setsFlagAndUrl() {
        pending.attachMedicalCert("https://storage.example.com/cert.pdf");
        assertThat(pending.isHasMedicalCert()).isTrue();
        assertThat(pending.getAttachmentUrl()).isEqualTo("https://storage.example.com/cert.pdf");
    }
}
