package com.andikisha.employee.domain.exception;

import com.andikisha.common.exception.ResourceNotFoundException;
import java.util.UUID;

public class DepartmentNotFoundException extends ResourceNotFoundException {
    public DepartmentNotFoundException(UUID id) {
        super("Department", id);
    }
}
