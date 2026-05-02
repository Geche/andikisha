package com.andikisha.leave.application.service;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.leave.application.dto.request.SubmitLeaveRequest;
import com.andikisha.leave.application.dto.response.LeaveRequestResponse;
import com.andikisha.leave.application.mapper.LeaveMapper;
import com.andikisha.leave.application.port.LeaveEventPublisher;
import com.andikisha.leave.domain.exception.LeaveRequestNotFoundException;
import com.andikisha.leave.domain.model.LeaveBalance;
import com.andikisha.leave.domain.model.LeavePolicy;
import com.andikisha.leave.domain.model.LeaveRequest;
import com.andikisha.leave.domain.model.LeaveRequestStatus;
import com.andikisha.leave.domain.model.LeaveType;
import com.andikisha.leave.domain.repository.LeaveBalanceRepository;
import com.andikisha.leave.domain.repository.LeavePolicyRepository;
import com.andikisha.leave.domain.repository.LeaveRequestRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class LeaveService {

    private static final Logger log = LoggerFactory.getLogger(LeaveService.class);

    private final LeaveRequestRepository requestRepository;
    private final LeaveBalanceRepository balanceRepository;
    private final LeavePolicyRepository policyRepository;
    private final LeaveMapper mapper;
    private final LeaveEventPublisher eventPublisher;

    public LeaveService(LeaveRequestRepository requestRepository,
                        LeaveBalanceRepository balanceRepository,
                        LeavePolicyRepository policyRepository,
                        LeaveMapper mapper,
                        LeaveEventPublisher eventPublisher) {
        this.requestRepository = requestRepository;
        this.balanceRepository = balanceRepository;
        this.policyRepository = policyRepository;
        this.mapper = mapper;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public LeaveRequestResponse submit(UUID employeeId, String employeeName,
                                       SubmitLeaveRequest request) {
        String tenantId = TenantContext.requireTenantId();
        LeaveType leaveType;
        try {
            leaveType = LeaveType.valueOf(request.leaveType().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BusinessRuleException("INVALID_LEAVE_TYPE",
                    "Unknown leave type: " + request.leaveType());
        }

        // Validate against policy
        LeavePolicy policy = policyRepository.findByTenantIdAndLeaveType(tenantId, leaveType)
                .orElseThrow(() -> new BusinessRuleException(
                        "POLICY_NOT_FOUND", "No leave policy found for type: " + leaveType));

        // Check notice period
        if (policy.getMinDaysNotice() > 0) {
            long daysUntilStart = java.time.temporal.ChronoUnit.DAYS.between(
                    LocalDate.now(), request.startDate());
            if (daysUntilStart < policy.getMinDaysNotice()) {
                throw new BusinessRuleException("INSUFFICIENT_NOTICE",
                        "This leave type requires at least " + policy.getMinDaysNotice()
                                + " days notice");
            }
        }

        // Check max consecutive days
        if (policy.getMaxConsecutiveDays() != null
                && request.days().compareTo(BigDecimal.valueOf(policy.getMaxConsecutiveDays())) > 0) {
            throw new BusinessRuleException("EXCEEDS_MAX_CONSECUTIVE",
                    "Maximum consecutive days for " + leaveType + " is "
                            + policy.getMaxConsecutiveDays());
        }

        // Check balance (except unpaid leave)
        if (leaveType != LeaveType.UNPAID) {
            int year = request.startDate().getYear();
            LeaveBalance balance = balanceRepository
                    .findByTenantIdAndEmployeeIdAndLeaveTypeAndYear(
                            tenantId, employeeId, leaveType, year)
                    .orElseThrow(() -> new BusinessRuleException("NO_BALANCE",
                            "No leave balance found. Contact HR to initialize your leave."));

            // Subtract days already committed to other PENDING requests so that
            // concurrent submissions cannot both succeed against the same balance.
            LocalDate yearStart = LocalDate.of(year, 1, 1);
            LocalDate yearEnd   = LocalDate.of(year, 12, 31);
            BigDecimal pendingDays = requestRepository.sumDaysByStatus(
                    tenantId, employeeId, leaveType, LeaveRequestStatus.PENDING,
                    yearStart, yearEnd);
            BigDecimal effectiveAvailable = balance.getAvailable().subtract(pendingDays);

            if (request.days().compareTo(effectiveAvailable) > 0) {
                throw new BusinessRuleException("INSUFFICIENT_BALANCE",
                        "Insufficient " + leaveType + " balance. Available (excluding pending): "
                                + effectiveAvailable + ", Requested: " + request.days());
            }
        }

        // Check for overlapping approved leave
        List<LeaveRequest> overlapping = requestRepository.findOverlappingByEmployee(
                tenantId, employeeId, LeaveRequestStatus.APPROVED,
                request.startDate(), request.endDate());
        if (!overlapping.isEmpty()) {
            throw new BusinessRuleException("OVERLAPPING_LEAVE",
                    "You already have approved leave during this period");
        }

        LeaveRequest leaveRequest = LeaveRequest.create(
                tenantId, employeeId, employeeName, leaveType,
                request.startDate(), request.endDate(),
                request.days(), request.reason()
        );

        leaveRequest = requestRepository.save(leaveRequest);
        eventPublisher.publishLeaveRequested(leaveRequest);
        log.info("Leave request submitted by {} for {} days of {}",
                employeeName, request.days(), leaveType);

        return mapper.toResponse(leaveRequest);
    }

    @Transactional
    public LeaveRequestResponse approve(UUID leaveRequestId, UUID reviewerId,
                                        String reviewerName) {
        String tenantId = TenantContext.requireTenantId();

        LeaveRequest request = requestRepository.findByIdAndTenantId(leaveRequestId, tenantId)
                .orElseThrow(() -> new LeaveRequestNotFoundException(leaveRequestId));

        if (request.getEmployeeId().equals(reviewerId)) {
            throw new BusinessRuleException("SELF_APPROVAL_PROHIBITED",
                    "A manager cannot approve their own leave request. " +
                    "employeeId=" + reviewerId);
        }

        // Transition state first — this validates the request is still PENDING
        // (guards against concurrent approvals deducting the balance twice)
        request.approve(reviewerId, reviewerName);

        // Deduct from balance only after the state guard has passed
        if (request.getLeaveType() != LeaveType.UNPAID) {
            int year = request.getStartDate().getYear();
            LeaveBalance balance = balanceRepository
                    .findByTenantIdAndEmployeeIdAndLeaveTypeAndYear(
                            tenantId, request.getEmployeeId(), request.getLeaveType(), year)
                    .orElseThrow(() -> new BusinessRuleException("NO_BALANCE",
                            "Leave balance not found for employee"));

            balance.deduct(request.getDays());
            balanceRepository.save(balance);
        }

        request = requestRepository.save(request);

        eventPublisher.publishLeaveApproved(request);
        log.info("Leave approved for {} by {}", request.getEmployeeName(), reviewerName);

        return mapper.toResponse(request);
    }

    @Transactional
    public LeaveRequestResponse reject(UUID leaveRequestId, UUID reviewerId,
                                       String reviewerName, String rejectionReason) {
        String tenantId = TenantContext.requireTenantId();

        LeaveRequest request = requestRepository.findByIdAndTenantId(leaveRequestId, tenantId)
                .orElseThrow(() -> new LeaveRequestNotFoundException(leaveRequestId));

        request.reject(reviewerId, reviewerName, rejectionReason);
        request = requestRepository.save(request);

        eventPublisher.publishLeaveRejected(request);
        log.info("Leave rejected for {} by {}: {}",
                request.getEmployeeName(), reviewerName, rejectionReason);

        return mapper.toResponse(request);
    }

    @Transactional
    public void cancel(UUID leaveRequestId, UUID employeeId) {
        String tenantId = TenantContext.requireTenantId();

        LeaveRequest request = requestRepository.findByIdAndTenantId(leaveRequestId, tenantId)
                .orElseThrow(() -> new LeaveRequestNotFoundException(leaveRequestId));

        if (!request.getEmployeeId().equals(employeeId)) {
            throw new BusinessRuleException("NOT_OWNER",
                    "You can only cancel your own leave requests");
        }

        request.cancel();
        requestRepository.save(request);
    }

    /**
     * HR-only reversal of an approved leave request.
     * Restores the employee's balance and publishes a LeaveReversedEvent.
     */
    @Transactional
    public LeaveRequestResponse hrReverse(UUID leaveRequestId, UUID reversedBy,
                                          String reversedByName, String reason) {
        String tenantId = TenantContext.requireTenantId();

        LeaveRequest request = requestRepository.findByIdAndTenantId(leaveRequestId, tenantId)
                .orElseThrow(() -> new LeaveRequestNotFoundException(leaveRequestId));

        // State guard first: throws if not APPROVED
        request.reverse(reversedBy, reversedByName, reason);

        // Restore balance
        if (request.getLeaveType() != LeaveType.UNPAID) {
            int year = request.getStartDate().getYear();
            LeaveRequest finalRequest = request;
            balanceRepository.findByTenantIdAndEmployeeIdAndLeaveTypeAndYear(
                            tenantId, request.getEmployeeId(), request.getLeaveType(), year)
                    .ifPresent(balance -> {
                        balance.restore(finalRequest.getDays());
                        balanceRepository.save(balance);
                    });
        }

        request = requestRepository.save(request);
        eventPublisher.publishLeaveReversed(request);
        log.info("Leave reversed for {} by {} — reason: {}", request.getEmployeeName(), reversedByName, reason);

        return mapper.toResponse(request);
    }

    public Page<LeaveRequestResponse> listRequests(String status, Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();
        if (status != null) {
            LeaveRequestStatus requestStatus;
            try {
                requestStatus = LeaveRequestStatus.valueOf(status.toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new BusinessRuleException("INVALID_STATUS", "Unknown leave status: " + status);
            }
            return requestRepository.findByTenantIdAndStatusOrderByCreatedAtDesc(
                            tenantId, requestStatus, pageable)
                    .map(mapper::toResponse);
        }
        return requestRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable)
                .map(mapper::toResponse);
    }

    public Page<LeaveRequestResponse> listEmployeeRequests(UUID employeeId, Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();
        return requestRepository.findByTenantIdAndEmployeeIdOrderByCreatedAtDesc(
                        tenantId, employeeId, pageable)
                .map(mapper::toResponse);
    }

    public LeaveRequestResponse getRequest(UUID leaveRequestId) {
        String tenantId = TenantContext.requireTenantId();
        return requestRepository.findByIdAndTenantId(leaveRequestId, tenantId)
                .map(mapper::toResponse)
                .orElseThrow(() -> new LeaveRequestNotFoundException(leaveRequestId));
    }
}