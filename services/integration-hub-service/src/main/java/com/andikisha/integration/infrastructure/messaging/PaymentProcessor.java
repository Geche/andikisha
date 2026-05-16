package com.andikisha.integration.infrastructure.messaging;

import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.integration.application.port.BankTransferClient;
import com.andikisha.integration.application.port.IntegrationEventPublisher;
import com.andikisha.integration.application.port.MpesaClient;
import java.math.BigDecimal;
import com.andikisha.integration.domain.model.IntegrationConfig;
import com.andikisha.integration.domain.model.IntegrationType;
import com.andikisha.integration.domain.model.KenyanBank;
import com.andikisha.integration.domain.model.PaymentMethod;
import com.andikisha.integration.domain.model.PaymentTransaction;
import com.andikisha.integration.domain.model.TransactionStatus;
import com.andikisha.integration.domain.repository.IntegrationConfigRepository;
import com.andikisha.integration.domain.repository.PaymentTransactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.support.TransactionTemplate;

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
    private final boolean mpesaSandbox;
    private final TransactionTemplate requiresNewTx;

    public PaymentProcessor(PaymentTransactionRepository transactionRepository,
                            IntegrationConfigRepository configRepository,
                            MpesaClient mpesaClient,
                            BankTransferClient bankTransferClient,
                            IntegrationEventPublisher eventPublisher,
                            PlatformTransactionManager transactionManager,
                            @org.springframework.beans.factory.annotation.Value("${app.mpesa.enabled:false}") boolean mpesaEnabled) {
        this.transactionRepository = transactionRepository;
        this.configRepository = configRepository;
        this.mpesaClient = mpesaClient;
        this.bankTransferClient = bankTransferClient;
        this.eventPublisher = eventPublisher;
        this.mpesaSandbox = !mpesaEnabled;
        this.requiresNewTx = new TransactionTemplate(transactionManager);
        this.requiresNewTx.setPropagationBehavior(org.springframework.transaction.TransactionDefinition.PROPAGATION_REQUIRES_NEW);
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

        // In sandbox mode, IntegrationConfig is not required; complete immediately.
        if (config == null && !mpesaSandbox) {
            tx.markFailed("CONFIG_MISSING", "M-Pesa B2C integration not configured");
            transactionRepository.save(tx);
            log.warn("M-Pesa not configured for tenant {}", tx.getTenantId());
            return;
        }

        try {
            String reference = "PAY-" + tx.getId().toString().substring(0, 8).toUpperCase();
            String remarks = "Salary payment " + tx.getEmployeeName();

            String shortcode  = config != null ? config.getShortcode()  : "sandbox";
            String initiator  = config != null ? config.getInitiatorName() : "sandbox";
            String credential = config != null ? config.getSecurityCredential() : "";
            String callback   = config != null ? config.getCallbackUrl() : "";
            String timeout    = config != null ? config.getTimeoutUrl()  : "";

            MpesaClient.MpesaResponse response = mpesaClient.sendB2C(
                    shortcode, initiator, credential,
                    tx.getPhoneNumber(), tx.getAmount(),
                    remarks, reference, callback, timeout
            );

            if (response.success()) {
                tx.markSubmitted(reference, response.conversationId());
                log.info("M-Pesa B2C submitted for {} amount KES {}",
                        tx.getEmployeeName(), tx.getAmount());

                // Sandbox: no callback will arrive — complete immediately so the run progresses
                if (config == null) {
                    tx.markCompleted(response.conversationId());
                    transactionRepository.save(tx);
                    eventPublisher.publishPaymentCompleted(tx);
                    maybePublishRunCompleted(tx.getTenantId(), tx.getPayrollRunId());
                    log.info("Sandbox M-Pesa completed immediately for {} receipt {}",
                            tx.getEmployeeName(), response.conversationId());
                    return;
                }
            } else {
                tx.markFailed(response.responseCode(), response.responseDescription());
                log.error("M-Pesa B2C failed for {}: {}",
                        tx.getEmployeeName(), response.responseDescription());
            }

            transactionRepository.save(tx);

            if (tx.getStatus() == TransactionStatus.FAILED) {
                eventPublisher.publishPaymentFailed(tx);
            }

        } catch (Exception e) {
            tx.markFailed("EXCEPTION", e.getMessage());
            transactionRepository.save(tx);
            eventPublisher.publishPaymentFailed(tx);
            log.error("M-Pesa exception for {}: {}", tx.getEmployeeName(), e.getMessage());
        }

        if (tx.getStatus() == TransactionStatus.COMPLETED
                || tx.getStatus() == TransactionStatus.FAILED) {
            maybePublishRunCompleted(tx.getTenantId(), tx.getPayrollRunId());
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

        if (tx.getStatus() == TransactionStatus.COMPLETED
                || tx.getStatus() == TransactionStatus.FAILED) {
            maybePublishRunCompleted(tx.getTenantId(), tx.getPayrollRunId());
        }
    }

    /**
     * Defers the run-completion check to after the current transaction commits, then re-counts
     * in a fresh REQUIRES_NEW transaction so all concurrent payment commits are visible.
     * Without this, parallel payment threads each see their own uncommitted save and may all
     * count (n-1) rows — missing the trigger. The idempotent PayrollRun.complete() guard in
     * payroll-service handles the rare case where two threads both publish.
     */
    private void maybePublishRunCompleted(String tenantId, UUID payrollRunId) {
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                requiresNewTx.execute(status -> {
                    long total = transactionRepository.countByTenantIdAndPayrollRunId(tenantId, payrollRunId);
                    long completed = transactionRepository.countByTenantIdAndPayrollRunIdAndStatus(
                            tenantId, payrollRunId, TransactionStatus.COMPLETED);
                    long failed = transactionRepository.countByTenantIdAndPayrollRunIdAndStatus(
                            tenantId, payrollRunId, TransactionStatus.FAILED);
                    if (total > 0 && (completed + failed) == total) {
                        BigDecimal totalDisbursed = transactionRepository
                                .findByTenantIdAndPayrollRunId(tenantId, payrollRunId).stream()
                                .filter(t -> t.getStatus() == TransactionStatus.COMPLETED)
                                .map(PaymentTransaction::getAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);
                        eventPublisher.publishPaymentsCompleted(
                                tenantId, payrollRunId.toString(), completed, failed, totalDisbursed);
                    }
                    return null;
                });
            }
        });
    }
}
