package com.andikisha.events.payroll;

import com.andikisha.events.BaseEvent;
import java.math.BigDecimal;

public class PaymentCompletedEvent extends BaseEvent {

    private String payrollRunId;
    private String paySlipId;
    private String employeeId;
    private String providerReceipt;
    private BigDecimal amount;
    private String phoneNumber;
    private String paymentMethod;

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

    protected PaymentCompletedEvent() { super(); }

    public String getPayrollRunId() { return payrollRunId; }
    public String getPaySlipId() { return paySlipId; }
    public String getEmployeeId() { return employeeId; }
    public String getProviderReceipt() { return providerReceipt; }
    public BigDecimal getAmount() { return amount; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getPaymentMethod() { return paymentMethod; }
}
