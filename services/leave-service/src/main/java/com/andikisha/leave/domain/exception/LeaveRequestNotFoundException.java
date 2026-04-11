package com.andikisha.leave.domain.exception;

import com.andikisha.common.exception.ResourceNotFoundException;
import java.util.UUID;

public class LeaveRequestNotFoundException extends ResourceNotFoundException {
    public LeaveRequestNotFoundException(UUID id) {
        super("LeaveRequest", id);
    }
}