package com.andikisha.leave.unit;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.leave.application.dto.request.SubmitLeaveRequest;
import com.andikisha.leave.application.dto.response.LeaveRequestResponse;
import com.andikisha.common.scope.ResolvedScope;
import com.andikisha.leave.application.mapper.LeaveMapper;
import com.andikisha.leave.application.port.LeaveEventPublisher;
import com.andikisha.leave.application.service.CallerScopeResolver;
import com.andikisha.leave.application.service.LeaveService;
import com.andikisha.leave.infrastructure.grpc.EmployeeGrpcClient;
import com.andikisha.leave.domain.exception.LeaveRequestNotFoundException;
import com.andikisha.leave.domain.model.LeaveBalance;
import com.andikisha.leave.domain.model.LeavePolicy;
import com.andikisha.leave.domain.model.LeaveRequest;
import com.andikisha.leave.domain.model.LeaveRequestStatus;
import com.andikisha.leave.domain.model.LeaveType;
import com.andikisha.leave.domain.repository.LeaveBalanceRepository;
import com.andikisha.leave.domain.repository.LeavePolicyRepository;
import com.andikisha.leave.domain.repository.LeaveRequestRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.security.access.AccessDeniedException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LeaveServiceTest {

    @Mock private LeaveRequestRepository requestRepository;
    @Mock private LeaveBalanceRepository balanceRepository;
    @Mock private LeavePolicyRepository policyRepository;
    @Mock private LeaveMapper mapper;
    @Mock private LeaveEventPublisher eventPublisher;
    @Mock private CallerScopeResolver scopeResolver;
    @Mock private EmployeeGrpcClient employeeGrpcClient;

    @InjectMocks private LeaveService leaveService;

    private static final String TENANT_ID   = "test-tenant";
    private static final UUID   EMPLOYEE_ID = UUID.randomUUID();
    private static final UUID   REVIEWER_ID = UUID.randomUUID();
    private static final UUID   REQUEST_ID  = UUID.randomUUID();

    @BeforeEach
    void setUp() { TenantContext.setTenantId(TENANT_ID); }

    @AfterEach
    void tearDown() { TenantContext.clear(); }

    // ------------------------------------------------------------------
    // submit
    // ------------------------------------------------------------------

    @Test
    void submit_withSufficientBalance_createsRequest() {
        var dto = new SubmitLeaveRequest(
                "ANNUAL",
                LocalDate.now().plusDays(7),
                LocalDate.now().plusDays(11),
                BigDecimal.valueOf(5),
                "Family trip");

        LeavePolicy policy = LeavePolicy.create(TENANT_ID, LeaveType.ANNUAL, 21, 5, true, false);
        LeaveBalance balance = LeaveBalance.create(
                TENANT_ID, EMPLOYEE_ID, LeaveType.ANNUAL, 2026,
                BigDecimal.valueOf(21), BigDecimal.ZERO);

        when(policyRepository.findByTenantIdAndLeaveType(TENANT_ID, LeaveType.ANNUAL))
                .thenReturn(Optional.of(policy));
        when(balanceRepository.findByTenantIdAndEmployeeIdAndLeaveTypeAndYear(
                eq(TENANT_ID), eq(EMPLOYEE_ID), eq(LeaveType.ANNUAL), anyInt()))
                .thenReturn(Optional.of(balance));
        when(requestRepository.sumDaysByStatus(any(), any(), any(), any(), any(), any()))
                .thenReturn(BigDecimal.ZERO);
        when(requestRepository.findOverlappingByEmployee(any(), any(), any(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(requestRepository.save(any(LeaveRequest.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        LeaveRequestResponse mockResponse = mock(LeaveRequestResponse.class);
        when(mapper.toResponse(any(LeaveRequest.class))).thenReturn(mockResponse);

        var result = leaveService.submit(EMPLOYEE_ID, "Jane Doe", dto);

        assertThat(result).isNotNull();
        verify(requestRepository).save(any(LeaveRequest.class));
    }

    @Test
    void submit_withInsufficientBalance_throwsBusinessRule() {
        var dto = new SubmitLeaveRequest(
                "ANNUAL",
                LocalDate.now().plusDays(7),
                LocalDate.now().plusDays(37),
                BigDecimal.valueOf(30),
                "Long trip");

        LeavePolicy policy = LeavePolicy.create(TENANT_ID, LeaveType.ANNUAL, 21, 5, true, false);
        LeaveBalance balance = LeaveBalance.create(
                TENANT_ID, EMPLOYEE_ID, LeaveType.ANNUAL, 2026,
                BigDecimal.valueOf(10), BigDecimal.ZERO);

        when(policyRepository.findByTenantIdAndLeaveType(TENANT_ID, LeaveType.ANNUAL))
                .thenReturn(Optional.of(policy));
        when(balanceRepository.findByTenantIdAndEmployeeIdAndLeaveTypeAndYear(
                eq(TENANT_ID), eq(EMPLOYEE_ID), eq(LeaveType.ANNUAL), anyInt()))
                .thenReturn(Optional.of(balance));
        when(requestRepository.sumDaysByStatus(any(), any(), any(), any(), any(), any()))
                .thenReturn(BigDecimal.ZERO);

        assertThatThrownBy(() -> leaveService.submit(EMPLOYEE_ID, "Jane Doe", dto))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(ex -> assertThat(((BusinessRuleException) ex).getCode())
                        .isEqualTo("INSUFFICIENT_BALANCE"));

        verify(requestRepository, never()).save(any());
    }

    @Test
    void submit_withNoPolicyFound_throwsBusinessRule() {
        var dto = new SubmitLeaveRequest(
                "ANNUAL",
                LocalDate.now().plusDays(7),
                LocalDate.now().plusDays(11),
                BigDecimal.valueOf(5),
                "Trip");

        when(policyRepository.findByTenantIdAndLeaveType(TENANT_ID, LeaveType.ANNUAL))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> leaveService.submit(EMPLOYEE_ID, "Jane Doe", dto))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(ex -> assertThat(((BusinessRuleException) ex).getCode())
                        .isEqualTo("POLICY_NOT_FOUND"));
    }

    @Test
    void submit_withInvalidLeaveType_throwsBusinessRule() {
        var dto = new SubmitLeaveRequest(
                "NONEXISTENT",
                LocalDate.now().plusDays(7),
                LocalDate.now().plusDays(9),
                BigDecimal.valueOf(3),
                "Testing");

        assertThatThrownBy(() -> leaveService.submit(EMPLOYEE_ID, "Jane Doe", dto))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(ex -> assertThat(((BusinessRuleException) ex).getCode())
                        .isEqualTo("INVALID_LEAVE_TYPE"));
    }

    @Test
    void submit_withOverlappingApprovedLeave_throwsBusinessRule() {
        var dto = new SubmitLeaveRequest(
                "ANNUAL",
                LocalDate.now().plusDays(7),
                LocalDate.now().plusDays(11),
                BigDecimal.valueOf(5),
                "Trip");

        LeavePolicy policy = LeavePolicy.create(TENANT_ID, LeaveType.ANNUAL, 21, 5, true, false);
        LeaveBalance balance = LeaveBalance.create(
                TENANT_ID, EMPLOYEE_ID, LeaveType.ANNUAL, 2026,
                BigDecimal.valueOf(21), BigDecimal.ZERO);

        when(policyRepository.findByTenantIdAndLeaveType(TENANT_ID, LeaveType.ANNUAL))
                .thenReturn(Optional.of(policy));
        when(balanceRepository.findByTenantIdAndEmployeeIdAndLeaveTypeAndYear(any(), any(), any(), anyInt()))
                .thenReturn(Optional.of(balance));
        when(requestRepository.sumDaysByStatus(any(), any(), any(), any(), any(), any()))
                .thenReturn(BigDecimal.ZERO);
        when(requestRepository.findOverlappingByEmployee(any(), any(), any(), any(), any()))
                .thenReturn(List.of(mock(LeaveRequest.class)));

        assertThatThrownBy(() -> leaveService.submit(EMPLOYEE_ID, "Jane Doe", dto))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(ex -> assertThat(((BusinessRuleException) ex).getCode())
                        .isEqualTo("OVERLAPPING_LEAVE"));
    }

    @Test
    void submit_unpaidLeave_skipsBalanceCheck() {
        var dto = new SubmitLeaveRequest(
                "UNPAID",
                LocalDate.now().plusDays(7),
                LocalDate.now().plusDays(9),
                BigDecimal.valueOf(3),
                "Personal");

        LeavePolicy policy = LeavePolicy.create(TENANT_ID, LeaveType.UNPAID, 0, 0, true, false);

        when(policyRepository.findByTenantIdAndLeaveType(TENANT_ID, LeaveType.UNPAID))
                .thenReturn(Optional.of(policy));
        when(requestRepository.findOverlappingByEmployee(any(), any(), any(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(requestRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toResponse(any(LeaveRequest.class))).thenReturn(mock(LeaveRequestResponse.class));

        leaveService.submit(EMPLOYEE_ID, "Jane", dto);

        // Balance repository never queried for UNPAID leave
        verify(balanceRepository, never()).findByTenantIdAndEmployeeIdAndLeaveTypeAndYear(
                any(), any(), any(), anyInt());
    }

    @Test
    void submit_pastStartDate_currentlyAccepted_characterization() {
        // Day-4 A1: documents the gap. With minDaysNotice=0, a past start date is NOT
        // rejected today — a backdated ANNUAL request is accepted. When the policy
        // decision lands (reject past dates for non-retroactive types; keep SICK /
        // COMPASSIONATE backdatable), flip this to expect a PAST_START_DATE exception
        // and add a companion test that a backdated SICK request is still accepted.
        var dto = new SubmitLeaveRequest(
                "ANNUAL",
                LocalDate.now().minusDays(3),
                LocalDate.now().minusDays(1),
                BigDecimal.valueOf(3),
                "Backdated");

        LeavePolicy policy = LeavePolicy.create(TENANT_ID, LeaveType.ANNUAL, 21, 5, true, false);
        LeaveBalance balance = LeaveBalance.create(
                TENANT_ID, EMPLOYEE_ID, LeaveType.ANNUAL,
                LocalDate.now().minusDays(3).getYear(),
                BigDecimal.valueOf(21), BigDecimal.ZERO);

        when(policyRepository.findByTenantIdAndLeaveType(TENANT_ID, LeaveType.ANNUAL))
                .thenReturn(Optional.of(policy));
        when(balanceRepository.findByTenantIdAndEmployeeIdAndLeaveTypeAndYear(any(), any(), any(), anyInt()))
                .thenReturn(Optional.of(balance));
        when(requestRepository.sumDaysByStatus(any(), any(), any(), any(), any(), any()))
                .thenReturn(BigDecimal.ZERO);
        when(requestRepository.findOverlappingByEmployee(any(), any(), any(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(requestRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toResponse(any(LeaveRequest.class))).thenReturn(mock(LeaveRequestResponse.class));

        // Current behavior: accepted (no throw). Changes when the past-date rule is decided.
        assertThatCode(() -> leaveService.submit(EMPLOYEE_ID, "Jane Doe", dto))
                .doesNotThrowAnyException();
    }

    // ------------------------------------------------------------------
    // submit — server-authoritative day count (integrity: client `days` is untrusted)
    // ------------------------------------------------------------------

    @Test
    void submit_recomputesDaysFromDateRange_ignoringInflatedOrDeflatedClientValue() {
        // 5 inclusive calendar days (day 10 .. day 14), but client claims half a day
        var dto = new SubmitLeaveRequest(
                "ANNUAL",
                LocalDate.now().plusDays(10),
                LocalDate.now().plusDays(14),
                BigDecimal.valueOf(0.5),
                "Trip");

        LeavePolicy policy = LeavePolicy.create(TENANT_ID, LeaveType.ANNUAL, 21, 5, true, false);
        LeaveBalance balance = LeaveBalance.create(
                TENANT_ID, EMPLOYEE_ID, LeaveType.ANNUAL, 2026,
                BigDecimal.valueOf(21), BigDecimal.ZERO);

        when(policyRepository.findByTenantIdAndLeaveType(TENANT_ID, LeaveType.ANNUAL))
                .thenReturn(Optional.of(policy));
        when(balanceRepository.findByTenantIdAndEmployeeIdAndLeaveTypeAndYear(any(), any(), any(), anyInt()))
                .thenReturn(Optional.of(balance));
        when(requestRepository.sumDaysByStatus(any(), any(), any(), any(), any(), any()))
                .thenReturn(BigDecimal.ZERO);
        when(requestRepository.findOverlappingByEmployee(any(), any(), any(), any(), any()))
                .thenReturn(Collections.emptyList());
        when(requestRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toResponse(any(LeaveRequest.class))).thenReturn(mock(LeaveRequestResponse.class));

        leaveService.submit(EMPLOYEE_ID, "Jane Doe", dto);

        var captor = org.mockito.ArgumentCaptor.forClass(LeaveRequest.class);
        verify(requestRepository).save(captor.capture());
        assertThat(captor.getValue().getDays()).isEqualByComparingTo("5");
    }

    @Test
    void submit_underReportedDays_cannotBypassBalanceCheck() {
        // 30 inclusive calendar days, but client under-reports as 1 to slip past a thin balance
        var dto = new SubmitLeaveRequest(
                "ANNUAL",
                LocalDate.now().plusDays(10),
                LocalDate.now().plusDays(39),
                BigDecimal.ONE,
                "Long trip");

        LeavePolicy policy = LeavePolicy.create(TENANT_ID, LeaveType.ANNUAL, 21, 5, true, false);
        LeaveBalance balance = LeaveBalance.create(
                TENANT_ID, EMPLOYEE_ID, LeaveType.ANNUAL, 2026,
                BigDecimal.valueOf(10), BigDecimal.ZERO);

        when(policyRepository.findByTenantIdAndLeaveType(TENANT_ID, LeaveType.ANNUAL))
                .thenReturn(Optional.of(policy));
        when(balanceRepository.findByTenantIdAndEmployeeIdAndLeaveTypeAndYear(any(), any(), any(), anyInt()))
                .thenReturn(Optional.of(balance));
        when(requestRepository.sumDaysByStatus(any(), any(), any(), any(), any(), any()))
                .thenReturn(BigDecimal.ZERO);

        assertThatThrownBy(() -> leaveService.submit(EMPLOYEE_ID, "Jane Doe", dto))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(ex -> assertThat(((BusinessRuleException) ex).getCode())
                        .isEqualTo("INSUFFICIENT_BALANCE"));

        verify(requestRepository, never()).save(any());
    }

    @Test
    void submit_endDateBeforeStartDate_throwsInvalidDateRange() {
        var dto = new SubmitLeaveRequest(
                "ANNUAL",
                LocalDate.now().plusDays(14),
                LocalDate.now().plusDays(10),
                BigDecimal.valueOf(5),
                "Reversed range");

        // The date-range guard fires before any policy/balance lookup.
        assertThatThrownBy(() -> leaveService.submit(EMPLOYEE_ID, "Jane Doe", dto))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(ex -> assertThat(((BusinessRuleException) ex).getCode())
                        .isEqualTo("INVALID_DATE_RANGE"));

        verify(requestRepository, never()).save(any());
    }

    // ------------------------------------------------------------------
    // approve — the corrected order: state guard first, then deduct
    // ------------------------------------------------------------------

    @Test
    void approve_deductsBalanceAndTransitionsToApproved() {
        LeaveRequest request = LeaveRequest.create(
                TENANT_ID, EMPLOYEE_ID, "Jane Doe", LeaveType.ANNUAL,
                LocalDate.now().plusDays(7), LocalDate.now().plusDays(11),
                BigDecimal.valueOf(5), "Trip");

        LeaveBalance balance = LeaveBalance.create(
                TENANT_ID, EMPLOYEE_ID, LeaveType.ANNUAL, 2026,
                BigDecimal.valueOf(21), BigDecimal.ZERO);

        when(requestRepository.findByIdAndTenantId(REQUEST_ID, TENANT_ID))
                .thenReturn(Optional.of(request));
        when(balanceRepository.findByTenantIdAndEmployeeIdAndLeaveTypeAndYear(any(), any(), any(), anyInt()))
                .thenReturn(Optional.of(balance));
        when(requestRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toResponse(any(LeaveRequest.class))).thenReturn(mock(LeaveRequestResponse.class));

        leaveService.approve(REQUEST_ID, REVIEWER_ID, "Manager", null);

        assertThat(balance.getUsed()).isEqualByComparingTo("5");
        verify(eventPublisher).publishLeaveApproved(any());
    }

    @Test
    void approve_whenRequestNotFound_throws404() {
        when(requestRepository.findByIdAndTenantId(REQUEST_ID, TENANT_ID))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> leaveService.approve(REQUEST_ID, REVIEWER_ID, "Manager", null))
                .isInstanceOf(LeaveRequestNotFoundException.class);
    }

    @Test
    @org.junit.jupiter.api.DisplayName("Manager cannot approve their own leave request")
    void approve_reviewerIsRequestor_throwsBusinessRuleException() {
        UUID employeeId = UUID.randomUUID();
        UUID leaveRequestId = UUID.randomUUID();

        LeaveRequest selfRequest = LeaveRequest.create(
                TENANT_ID, employeeId, "Self Manager", LeaveType.ANNUAL,
                LocalDate.now().plusDays(7), LocalDate.now().plusDays(11),
                BigDecimal.valueOf(5), "Holiday");

        when(requestRepository.findByIdAndTenantId(eq(leaveRequestId), anyString()))
                .thenReturn(Optional.of(selfRequest));

        assertThatThrownBy(() -> leaveService.approve(leaveRequestId, employeeId, "Self Manager", null))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("cannot approve");
    }

    // ------------------------------------------------------------------
    // reject
    // ------------------------------------------------------------------

    @Test
    void reject_transitionsToRejectedAndPublishesEvent() {
        LeaveRequest request = LeaveRequest.create(
                TENANT_ID, EMPLOYEE_ID, "Jane", LeaveType.SICK,
                LocalDate.now().plusDays(1), LocalDate.now().plusDays(3),
                BigDecimal.valueOf(3), "Ill");

        when(requestRepository.findByIdAndTenantId(REQUEST_ID, TENANT_ID))
                .thenReturn(Optional.of(request));
        when(requestRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toResponse(any(LeaveRequest.class))).thenReturn(mock(LeaveRequestResponse.class));

        leaveService.reject(REQUEST_ID, REVIEWER_ID, "Manager", "No cover");

        assertThat(request.getStatus()).isEqualTo(LeaveRequestStatus.REJECTED);
        verify(eventPublisher).publishLeaveRejected(any());
    }

    // ------------------------------------------------------------------
    // cancel
    // ------------------------------------------------------------------

    @Test
    void cancel_ownPendingRequest_succeeds() {
        LeaveRequest request = LeaveRequest.create(
                TENANT_ID, EMPLOYEE_ID, "Jane", LeaveType.ANNUAL,
                LocalDate.now().plusDays(7), LocalDate.now().plusDays(9),
                BigDecimal.valueOf(3), "Plan changed");

        when(requestRepository.findByIdAndTenantId(REQUEST_ID, TENANT_ID))
                .thenReturn(Optional.of(request));

        leaveService.cancel(REQUEST_ID, EMPLOYEE_ID);

        assertThat(request.getStatus()).isEqualTo(LeaveRequestStatus.CANCELLED);
        verify(requestRepository).save(request);
    }

    @Test
    void cancel_otherEmployeesRequest_throwsBusinessRule() {
        UUID otherEmployee = UUID.randomUUID();
        LeaveRequest request = LeaveRequest.create(
                TENANT_ID, otherEmployee, "Other", LeaveType.ANNUAL,
                LocalDate.now().plusDays(7), LocalDate.now().plusDays(9),
                BigDecimal.valueOf(3), "Trip");

        when(requestRepository.findByIdAndTenantId(REQUEST_ID, TENANT_ID))
                .thenReturn(Optional.of(request));

        assertThatThrownBy(() -> leaveService.cancel(REQUEST_ID, EMPLOYEE_ID))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(ex -> assertThat(((BusinessRuleException) ex).getCode())
                        .isEqualTo("NOT_OWNER"));
    }

    // ------------------------------------------------------------------
    // hrReverse
    // ------------------------------------------------------------------

    @Test
    void hrReverse_restoresBalanceAndPublishesEvent() {
        LeaveRequest request = LeaveRequest.create(
                TENANT_ID, EMPLOYEE_ID, "Jane", LeaveType.ANNUAL,
                LocalDate.now().plusDays(7), LocalDate.now().plusDays(11),
                BigDecimal.valueOf(5), "Trip");
        request.approve(REVIEWER_ID, "Manager");

        LeaveBalance balance = LeaveBalance.create(
                TENANT_ID, EMPLOYEE_ID, LeaveType.ANNUAL, 2026,
                BigDecimal.valueOf(21), BigDecimal.ZERO);
        balance.deduct(BigDecimal.valueOf(5)); // simulates the deduction done at approval time

        when(requestRepository.findByIdAndTenantId(REQUEST_ID, TENANT_ID))
                .thenReturn(Optional.of(request));
        when(balanceRepository.findByTenantIdAndEmployeeIdAndLeaveTypeAndYear(any(), any(), any(), anyInt()))
                .thenReturn(Optional.of(balance));
        when(requestRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toResponse(any(LeaveRequest.class))).thenReturn(mock(LeaveRequestResponse.class));

        leaveService.hrReverse(REQUEST_ID, REVIEWER_ID, "HR Manager", "Employee resigned");

        assertThat(balance.getUsed()).isEqualByComparingTo("0"); // restored
        verify(eventPublisher).publishLeaveReversed(any());
    }

    @Test
    void hrReverse_whenRequestNotFound_throws404() {
        when(requestRepository.findByIdAndTenantId(REQUEST_ID, TENANT_ID))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> leaveService.hrReverse(REQUEST_ID, REVIEWER_ID, "HR", "reason"))
                .isInstanceOf(LeaveRequestNotFoundException.class);
    }

    @Test
    void hrReverse_nonApprovedRequest_throwsBusinessRule() {
        LeaveRequest request = LeaveRequest.create(
                TENANT_ID, EMPLOYEE_ID, "Jane", LeaveType.ANNUAL,
                LocalDate.now().plusDays(7), LocalDate.now().plusDays(11),
                BigDecimal.valueOf(5), "Trip");
        // Still PENDING — reverse() will throw

        when(requestRepository.findByIdAndTenantId(REQUEST_ID, TENANT_ID))
                .thenReturn(Optional.of(request));

        assertThatThrownBy(() -> leaveService.hrReverse(REQUEST_ID, REVIEWER_ID, "HR", "reason"))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("not APPROVED");
    }

    @Test
    void hrReverse_unpaidLeave_doesNotTouchBalance() {
        LeaveRequest request = LeaveRequest.create(
                TENANT_ID, EMPLOYEE_ID, "Jane", LeaveType.UNPAID,
                LocalDate.now().plusDays(7), LocalDate.now().plusDays(9),
                BigDecimal.valueOf(3), "Personal");
        request.approve(REVIEWER_ID, "Manager");

        when(requestRepository.findByIdAndTenantId(REQUEST_ID, TENANT_ID))
                .thenReturn(Optional.of(request));
        when(requestRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(mapper.toResponse(any(LeaveRequest.class))).thenReturn(mock(LeaveRequestResponse.class));

        leaveService.hrReverse(REQUEST_ID, REVIEWER_ID, "HR", "reason");

        verify(balanceRepository, never()).findByTenantIdAndEmployeeIdAndLeaveTypeAndYear(
                any(), any(), any(), anyInt());
    }

    // ------------------------------------------------------------------
    // listRequests
    // ------------------------------------------------------------------

    @Test
    void listRequests_withValidStatus_filtersCorrectly() {
        when(scopeResolver.resolve(any(), any(), any())).thenReturn(ResolvedScope.all());
        when(requestRepository.findByTenantIdAndStatusOrderByCreatedAtDesc(
                eq(TENANT_ID), eq(LeaveRequestStatus.PENDING), any()))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        var result = leaveService.listRequests("HR_MANAGER", null, "PENDING", PageRequest.of(0, 20));
        assertThat(result).isEmpty();
    }

    @Test
    void listRequests_withInvalidStatus_throwsBusinessRule() {
        // scope resolver is not reached — status parse fails first
        assertThatThrownBy(() -> leaveService.listRequests("HR_MANAGER", null, "BOGUS", PageRequest.of(0, 20)))
                .isInstanceOf(BusinessRuleException.class)
                .satisfies(ex -> assertThat(((BusinessRuleException) ex).getCode())
                        .isEqualTo("INVALID_STATUS"));
    }

    @Test
    void listRequests_withNullStatus_returnsAllRequests() {
        when(scopeResolver.resolve(any(), any(), any())).thenReturn(ResolvedScope.all());
        when(requestRepository.findByTenantIdOrderByCreatedAtDesc(eq(TENANT_ID), any()))
                .thenReturn(new PageImpl<>(Collections.emptyList()));

        var result = leaveService.listRequests("HR_MANAGER", null, null, PageRequest.of(0, 20));
        assertThat(result).isEmpty();
    }

    // ------------------------------------------------------------------
    // getRequest
    // ------------------------------------------------------------------

    @Test
    void getRequest_whenNotFound_throws404() {
        when(requestRepository.findByIdAndTenantId(REQUEST_ID, TENANT_ID))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> leaveService.getRequest(REQUEST_ID, "HR_MANAGER", null))
                .isInstanceOf(LeaveRequestNotFoundException.class);
    }

    @Test
    void getRequest_hrManagerAllScope_returnsRequest() {
        LeaveRequest request = sampleRequest();
        when(requestRepository.findByIdAndTenantId(REQUEST_ID, TENANT_ID))
                .thenReturn(Optional.of(request));
        when(scopeResolver.resolve(any(), any(), any())).thenReturn(ResolvedScope.all());
        LeaveRequestResponse resp = mock(LeaveRequestResponse.class);
        when(mapper.toResponse(eq(request), any())).thenReturn(resp);

        assertThat(leaveService.getRequest(REQUEST_ID, "HR_MANAGER", null)).isSameAs(resp);
    }

    @Test
    void getRequest_employeeOwnRequest_ownScope_returnsRequest() {
        LeaveRequest request = sampleRequest(); // owned by EMPLOYEE_ID
        when(requestRepository.findByIdAndTenantId(REQUEST_ID, TENANT_ID))
                .thenReturn(Optional.of(request));
        when(scopeResolver.resolve(any(), any(), any())).thenReturn(ResolvedScope.own());
        LeaveRequestResponse resp = mock(LeaveRequestResponse.class);
        when(mapper.toResponse(eq(request), any())).thenReturn(resp);

        assertThat(leaveService.getRequest(REQUEST_ID, "EMPLOYEE", EMPLOYEE_ID.toString()))
                .isSameAs(resp);
    }

    @Test
    void getRequest_employeeOtherRequest_ownScope_throwsAccessDenied() {
        LeaveRequest request = sampleRequest(); // owned by EMPLOYEE_ID
        when(requestRepository.findByIdAndTenantId(REQUEST_ID, TENANT_ID))
                .thenReturn(Optional.of(request));
        when(scopeResolver.resolve(any(), any(), any())).thenReturn(ResolvedScope.own());

        String otherEmployeeId = UUID.randomUUID().toString();
        assertThatThrownBy(() ->
                leaveService.getRequest(REQUEST_ID, "EMPLOYEE", otherEmployeeId))
                .isInstanceOf(AccessDeniedException.class);
        verify(mapper, never()).toResponse(any(LeaveRequest.class));
    }

    private LeaveRequest sampleRequest() {
        return LeaveRequest.create(
                TENANT_ID, EMPLOYEE_ID, "Jane Doe", LeaveType.ANNUAL,
                LocalDate.now().plusDays(7), LocalDate.now().plusDays(11),
                BigDecimal.valueOf(5), "Trip");
    }
}
