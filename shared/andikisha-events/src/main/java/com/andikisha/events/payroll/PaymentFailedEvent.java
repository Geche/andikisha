package com.andikisha.events.payroll;

import com.andikisha.events.BaseEvent;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class PaymentFailedEvent extends BaseEvent {

    private final String payrollRunId;
    private final String paySlipId;
    private final String employeeId;
    private final String employeeName;
    private final String paymentMethod;
    private final BigDecimal amount;
    private final String errorCode;
    private final String errorMessage;

    public PaymentFailedEvent(String tenantId, String payrollRunId,
                              String paySlipId, String employeeId,
                              String employeeName, String paymentMethod,
                              BigDecimal amount, String errorCode,
                              String errorMessage) {
        super("payment.failed", tenantId);
        this.payrollRunId = payrollRunId;
        this.paySlipId = paySlipId;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.paymentMethod = paymentMethod;
        this.amount = amount;
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
    }

    protected PaymentFailedEvent() {
        super();
        this.payrollRunId = null;
        this.paySlipId = null;
        this.employeeId = null;
        this.employeeName = null;
        this.paymentMethod = null;
        this.amount = null;
        this.errorCode = null;
        this.errorMessage = null;
    }

}
