package com.andikisha.events.payroll;

import com.andikisha.events.BaseEvent;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
public class PaymentFailedEvent extends BaseEvent {

    private String payrollRunId;
    private String paySlipId;
    private String employeeId;
    private String employeeName;
    private String paymentMethod;
    private BigDecimal amount;
    private String errorCode;
    private String errorMessage;

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

    protected PaymentFailedEvent() { super(); }

}
