package com.andikisha.events.payroll;

import com.andikisha.events.BaseEvent;
import java.math.BigDecimal;

public class PaymentCompletedEvent extends BaseEvent {

    private final String payrollRunId;
    private final String paySlipId;
    private final String employeeId;
    private final String providerReceipt;
    private final BigDecimal amount;
    private final String phoneNumber;
    private final String paymentMethod;

    public PaymentCompletedEvent(String tenantId, String payrollRunId,
                                 String paySlipId, String employeeId,
                                 String providerReceipt, BigDecimal amount,
                                 String phoneNumber, String paymentMethod) {
        super("payment.completed", tenantId);
        this.payrollRunId = payrollRunId;
        this.paySlipId = paySlipId;
        this.employeeId = employeeId;
        this.providerReceipt = providerReceipt;
        this.amount = amount;
        this.phoneNumber = phoneNumber;
        this.paymentMethod = paymentMethod;
    }

    protected PaymentCompletedEvent() {
        super();
        this.payrollRunId = null;
        this.paySlipId = null;
        this.employeeId = null;
        this.providerReceipt = null;
        this.amount = null;
        this.phoneNumber = null;
        this.paymentMethod = null;
    }

    public String getPayrollRunId() { return payrollRunId; }
    public String getPaySlipId() { return paySlipId; }
    public String getEmployeeId() { return employeeId; }
    public String getProviderReceipt() { return providerReceipt; }
    public BigDecimal getAmount() { return amount; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getPaymentMethod() { return paymentMethod; }
}
