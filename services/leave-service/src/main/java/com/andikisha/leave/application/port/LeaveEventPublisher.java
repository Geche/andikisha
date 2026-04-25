package com.andikisha.leave.application.port;

import com.andikisha.leave.domain.model.LeaveRequest;

public interface LeaveEventPublisher {

    void publishLeaveRequested(LeaveRequest request);

    void publishLeaveApproved(LeaveRequest request);

    void publishLeaveRejected(LeaveRequest request);

    void publishLeaveReversed(LeaveRequest request);
}