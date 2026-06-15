package com.andikisha.leave.application.dto.request;

import jakarta.validation.constraints.Size;

/**
 * Optional body for approving a leave request. The reviewer may attach a note
 * for the employee; the field is optional so callers can approve with no body.
 */
public record ApproveLeaveRequest(
        @Size(max = 1000, message = "Note must be at most 1000 characters")
        String notes
) {}
