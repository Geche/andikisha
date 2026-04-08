package com.andikisha.employee.domain.exception;

import com.andikisha.common.exception.ResourceNotFoundException;
import java.util.UUID;

public class EmployeeNotFoundException extends ResourceNotFoundException {
    public EmployeeNotFoundException(UUID id) {
        super("Employee", id);
    }
}