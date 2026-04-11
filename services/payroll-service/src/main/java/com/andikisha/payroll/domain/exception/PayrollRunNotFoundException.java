package com.andikisha.payroll.domain.exception;

import com.andikisha.common.exception.ResourceNotFoundException;
import java.util.UUID;

public class PayrollRunNotFoundException extends ResourceNotFoundException {
    public PayrollRunNotFoundException(UUID id) {
        super("PayrollRun", id);
    }
}