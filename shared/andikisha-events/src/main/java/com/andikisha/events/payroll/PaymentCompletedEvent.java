package com.andikisha.events.payroll;

import com.andikisha.events.BaseEvent;
import java.math.BigDecimal;

public class PaymentCompletedEvent extends BaseEvent {

    private final String paySlipId;
    private final String employeeId;
    private final BigDecimal amount;
    private final String currency;
    private final String mpesaReceiptNumber;

    public PaymentCompletedEvent(String tenantId, String paySlipId,
                                 String employeeId, BigDecimal amount, String currency,
                                 String mpesaReceiptNumber) {
        super("payment.completed", tenantId);
        this.paySlipId = paySlipId;
        this.employeeId = employeeId;
        this.amount = amount;
        this.currency = currency;
        this.mpesaReceiptNumber = mpesaReceiptNumber;
    }

    protected PaymentCompletedEvent() { super(); this.paySlipId = null; this.employeeId = null; this.amount = null; this.currency = null; this.mpesaReceiptNumber = null; }

    public String getPaySlipId() { return paySlipId; }
    public String getEmployeeId() { return employeeId; }
    public BigDecimal getAmount() { return amount; }
    public String getCurrency() { return currency; }
    public String getMpesaReceiptNumber() { return mpesaReceiptNumber; }
}