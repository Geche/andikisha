package com.andikisha.employee.domain.exception;

import com.andikisha.common.exception.ResourceNotFoundException;

import java.util.UUID;

public class PositionNotFoundException extends ResourceNotFoundException {
    public PositionNotFoundException(UUID id) {
        super("Position", id);
    }
}
