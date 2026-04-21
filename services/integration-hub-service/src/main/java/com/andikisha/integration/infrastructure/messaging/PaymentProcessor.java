package com.andikisha.integration.infrastructure.messaging;

import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.integration.application.port.BankTransferClient;
import com.andikisha.integration.application.port.IntegrationEventPublisher;
import com.andikisha.integration.application.port.MpesaClient;
import com.andikisha.integration.domain.model.IntegrationConfig;
import com.andikisha.integration.domain.model.IntegrationType;
import com.andikisha.integration.domain.model.KenyanBank;
import com.andikisha.integration.domain.model.PaymentMethod;
import com.andikisha.integration.domain.model.PaymentTransaction;
import com.andikisha.integration.domain.repository.IntegrationConfigRepository;
import com.andikisha.integration.domain.repository.PaymentTransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

/**
 * Separate @Component so Spring's AOP proxy intercepts @Async and @Transactional correctly.
 * PaymentService must call this bean — not a this.method() call — to ensure both annotations work.
 */
@Component
public class PaymentProcessor {

    private static final Logger log = LoggerFactory.getLogger(PaymentProcessor.class);

    private final PaymentTransactionRepository transactionRepository;
    private final IntegrationConfigRepository configRepository;
    private final MpesaClient mpesaClient;
    private final BankTransferClient bankTransferClient;
    private final IntegrationEventPublisher eventPublisher;

    public PaymentProcessor(PaymentTransactionRepository transactionRepository,
                            IntegrationConfigRepository configRepository,
                            MpesaClient mpesaClient,
                            BankTransferClient bankTransferClient,
                            IntegrationEventPublisher eventPublisher) {
        this.transactionRepository = transactionRepository;
        this.configRepository = configRepository;
        this.mpesaClient = mpesaClient;
        this.bankTransferClient = bankTransferClient;
        this.eventPublisher = eventPublisher;
    }

    @Async("paymentExecutor")
    @Transactional
    public void processPayment(UUID transactionId, String tenantId) {
        TenantContext.setTenantId(tenantId);
        try {
            PaymentTransaction tx = transactionRepository
                    .findByIdAndTenantId(transactionId, tenantId)
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "PaymentTransaction", transactionId));

            switch (tx.getPaymentMethod()) {
                case MPESA -> processMpesaPayment(tx);
                case BANK_TRANSFER -> processBankPayment(tx);
                default -> {
                    tx.markFailed("UNSUPPORTED",
                            "Payment method not supported: " + tx.getPaymentMethod());
                    transactionRepository.save(tx);
                }
            }
        } finally {
            TenantContext.clear();
        }
    }

    private void processMpesaPayment(PaymentTransaction tx) {
        IntegrationConfig config = configRepository
                .findByTenantIdAndIntegrationTypeAndActiveTrue(
                        tx.getTenantId(), IntegrationType.MPESA_B2C)
                .orElse(null);

        if (config == null) {
            tx.markFailed("CONFIG_MISSING", "M-Pesa B2C integration not configured");
            transactionRepository.save(tx);
            log.warn("M-Pesa not configured for tenant {}", tx.getTenantId());
            return;
        }

        try {
            String reference = "PAY-" + tx.getId().toString().substring(0, 8).toUpperCase();
            String remarks = "Salary payment " + tx.getEmployeeName();

            MpesaClient.MpesaResponse response = mpesaClient.sendB2C(
                    config.getShortcode(), config.getInitiatorName(),
                    config.getSecurityCredential(),
                    tx.getPhoneNumber(), tx.getAmount(),
                    remarks, reference,
                    config.getCallbackUrl(), config.getTimeoutUrl()
            );

            if (response.success()) {
                tx.markSubmitted(reference, response.conversationId());
                log.info("M-Pesa B2C submitted for {} amount KES {}",
                        tx.getEmployeeName(), tx.getAmount());
            } else {
                tx.markFailed(response.responseCode(), response.responseDescription());
                log.error("M-Pesa B2C failed for {}: {}",
                        tx.getEmployeeName(), response.responseDescription());
            }

            transactionRepository.save(tx);

        } catch (Exception e) {
            tx.markFailed("EXCEPTION", e.getMessage());
            transactionRepository.save(tx);
            log.error("M-Pesa exception for {}: {}", tx.getEmployeeName(), e.getMessage());
        }
    }

    private void processBankPayment(PaymentTransaction tx) {
        IntegrationConfig config = configRepository
                .findByTenantIdAndIntegrationTypeAndActiveTrue(
                        tx.getTenantId(), IntegrationType.BANK_TRANSFER)
                .orElse(null);

        if (config == null) {
            tx.markFailed("CONFIG_MISSING", "Bank transfer integration not configured");
            transactionRepository.save(tx);
            log.warn("Bank transfer not configured for tenant {}", tx.getTenantId());
            return;
        }

        try {
            String reference = "SAL-" + tx.getId().toString().substring(0, 8).toUpperCase();
            String narration = "Salary " + tx.getEmployeeName();

            String bankCode = KenyanBank.resolveCode(tx.getBankName());
            if (bankCode == null) {
                bankCode = "00";
            }

            BankTransferClient.BankTransferResponse response = bankTransferClient.send(
                    bankCode, tx.getBankAccount(), tx.getEmployeeName(),
                    tx.getAmount(), tx.getCurrency(), reference, narration
            );

            if (response.success()) {
                tx.markSubmitted(reference, response.transactionReference());
                tx.markCompleted(response.transactionReference());
                eventPublisher.publishPaymentCompleted(tx);
                log.info("Bank transfer completed for {} amount KES {} ref {}",
                        tx.getEmployeeName(), tx.getAmount(),
                        response.transactionReference());
            } else {
                tx.markFailed(response.responseCode(), response.responseDescription());
                eventPublisher.publishPaymentFailed(tx);
                log.error("Bank transfer failed for {}: {}",
                        tx.getEmployeeName(), response.responseDescription());
            }

            transactionRepository.save(tx);

        } catch (Exception e) {
            tx.markFailed("EXCEPTION", e.getMessage());
            transactionRepository.save(tx);
            eventPublisher.publishPaymentFailed(tx);
            log.error("Bank transfer exception for {}: {}", tx.getEmployeeName(), e.getMessage());
        }
    }
}
