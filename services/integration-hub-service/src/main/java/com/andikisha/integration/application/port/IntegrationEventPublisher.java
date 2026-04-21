package com.andikisha.integration.application.port;

import com.andikisha.integration.domain.model.PaymentTransaction;

public interface IntegrationEventPublisher {

    void publishPaymentCompleted(PaymentTransaction transaction);

    void publishPaymentFailed(PaymentTransaction transaction);
}