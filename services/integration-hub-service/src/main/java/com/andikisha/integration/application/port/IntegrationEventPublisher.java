package com.andikisha.integration.application.port;

import com.andikisha.integration.domain.model.PaymentTransaction;
import java.math.BigDecimal;

public interface IntegrationEventPublisher {

    void publishPaymentCompleted(PaymentTransaction transaction);

    void publishPaymentFailed(PaymentTransaction transaction);

    void publishPaymentsCompleted(String tenantId, String payrollRunId,
                                  long countSuccessful, long countFailed,
                                  BigDecimal totalDisbursed);
}