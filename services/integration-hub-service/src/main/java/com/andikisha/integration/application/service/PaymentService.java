package com.andikisha.integration.application.service;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.common.exception.ResourceNotFoundException;
import com.andikisha.common.tenant.TenantContext;
import com.andikisha.integration.application.dto.response.PaymentSummaryResponse;
import com.andikisha.integration.application.dto.response.PaymentTransactionResponse;
import com.andikisha.integration.application.port.IntegrationEventPublisher;
import com.andikisha.integration.domain.model.PaymentMethod;
import com.andikisha.integration.domain.model.PaymentTransaction;
import com.andikisha.integration.domain.model.TransactionStatus;
import com.andikisha.integration.domain.repository.PaymentTransactionRepository;
import com.andikisha.integration.infrastructure.messaging.PaymentProcessor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.List;
import java.util.UUID;

@Service
@Transactional(readOnly = true)
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);
    private static final String LOCK_PREFIX = "lock:disburse:";
    private static final String IDEMPOTENCY_PREFIX = "mpesa:callback:";
    private static final Duration LOCK_TTL = Duration.ofMinutes(30);
    private static final Duration IDEMPOTENCY_TTL = Duration.ofHours(24);

    private final PaymentTransactionRepository transactionRepository;
    private final PaymentProcessor paymentProcessor;
    private final IntegrationEventPublisher eventPublisher;
    private final StringRedisTemplate redisTemplate;

    public PaymentService(PaymentTransactionRepository transactionRepository,
                          PaymentProcessor paymentProcessor,
                          IntegrationEventPublisher eventPublisher,
                          StringRedisTemplate redisTemplate) {
        this.transactionRepository = transactionRepository;
        this.paymentProcessor = paymentProcessor;
        this.eventPublisher = eventPublisher;
        this.redisTemplate = redisTemplate;
    }

    @Transactional
    public PaymentTransaction createMpesaTransaction(String tenantId, UUID payrollRunId,
                                                     UUID paySlipId, UUID employeeId,
                                                     String employeeName,
                                                     String phoneNumber,
                                                     BigDecimal amount, String currency) {
        PaymentTransaction tx = PaymentTransaction.create(
                tenantId, payrollRunId, paySlipId, employeeId, employeeName,
                PaymentMethod.MPESA, phoneNumber, null, null,
                amount, currency);
        return transactionRepository.save(tx);
    }

    @Transactional
    public PaymentTransaction createBankTransaction(String tenantId, UUID payrollRunId,
                                                    UUID paySlipId, UUID employeeId,
                                                    String employeeName,
                                                    String bankName, String accountNumber,
                                                    BigDecimal amount, String currency) {
        PaymentTransaction tx = PaymentTransaction.create(
                tenantId, payrollRunId, paySlipId, employeeId, employeeName,
                PaymentMethod.BANK_TRANSFER, null, bankName, accountNumber,
                amount, currency);
        return transactionRepository.save(tx);
    }

    // Not @Transactional — each processPayment runs in its own transaction via PaymentProcessor
    public void processBatchPayments(String tenantId, UUID payrollRunId) {
        String lockKey = LOCK_PREFIX + tenantId + ":" + payrollRunId;
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, "1", LOCK_TTL);
        if (!Boolean.TRUE.equals(acquired)) {
            throw new BusinessRuleException("DISBURSEMENT_IN_PROGRESS",
                    "Disbursement is already in progress for payroll run " + payrollRunId);
        }

        try {
            List<PaymentTransaction> pending = transactionRepository
                    .findByTenantIdAndPayrollRunIdAndStatus(
                            tenantId, payrollRunId, TransactionStatus.PENDING);

            long mpesaCount = pending.stream()
                    .filter(tx -> tx.getPaymentMethod() == PaymentMethod.MPESA).count();
            long bankCount = pending.stream()
                    .filter(tx -> tx.getPaymentMethod() == PaymentMethod.BANK_TRANSFER).count();

            log.info("Processing {} payments for payroll run {} ({} M-Pesa, {} bank)",
                    pending.size(), payrollRunId, mpesaCount, bankCount);

            for (PaymentTransaction tx : pending) {
                paymentProcessor.processPayment(tx.getId(), tenantId);
            }
        } finally {
            redisTemplate.delete(lockKey);
        }
    }

    // Not @Transactional — each processPayment runs in its own transaction via PaymentProcessor
    public void retryFailed(String tenantId, UUID payrollRunId) {
        String lockKey = LOCK_PREFIX + tenantId + ":" + payrollRunId;
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(lockKey, "1", LOCK_TTL);
        if (!Boolean.TRUE.equals(acquired)) {
            throw new BusinessRuleException("DISBURSEMENT_IN_PROGRESS",
                    "Disbursement is already in progress for payroll run " + payrollRunId);
        }

        try {
            List<PaymentTransaction> failed = transactionRepository
                    .findByTenantIdAndPayrollRunIdAndStatus(
                            tenantId, payrollRunId, TransactionStatus.FAILED);

            int retryable = 0;
            for (PaymentTransaction tx : failed) {
                if (tx.canRetry()) {
                    paymentProcessor.processPayment(tx.getId(), tenantId);
                    retryable++;
                }
            }

            log.info("Retried {} of {} failed payments for payroll run {}",
                    retryable, failed.size(), payrollRunId);
        } finally {
            redisTemplate.delete(lockKey);
        }
    }

    @Transactional
    public void handleMpesaCallback(String conversationId, boolean success,
                                    String receiptNumber, String errorCode,
                                    String errorMessage) {
        // Idempotency guard — Safaricom can deliver duplicate callbacks
        String idempotencyKey = IDEMPOTENCY_PREFIX + conversationId;
        Boolean isNew = redisTemplate.opsForValue()
                .setIfAbsent(idempotencyKey, "1", IDEMPOTENCY_TTL);
        if (!Boolean.TRUE.equals(isNew)) {
            log.info("Duplicate M-Pesa callback for conversation {} — ignored", conversationId);
            return;
        }

        PaymentTransaction tx = transactionRepository
                .findByConversationId(conversationId)
                .orElse(null);

        if (tx == null) {
            log.warn("Callback received for unknown conversation: {}", conversationId);
            return;
        }

        if (success) {
            if (receiptNumber == null) {
                log.warn("M-Pesa callback success but no receipt for conversation {} — marking failed",
                        conversationId);
                tx.markFailed("NO_RECEIPT", "Success callback received without receipt number");
                eventPublisher.publishPaymentFailed(tx);
            } else {
                tx.markCompleted(receiptNumber);
                eventPublisher.publishPaymentCompleted(tx);
                log.info("M-Pesa payment completed for {} receipt {}",
                        tx.getEmployeeName(), receiptNumber);
            }
        } else {
            tx.markFailed(errorCode, errorMessage);
            eventPublisher.publishPaymentFailed(tx);
            log.error("M-Pesa payment failed for {}: {} {}",
                    tx.getEmployeeName(), errorCode, errorMessage);
        }

        transactionRepository.save(tx);
    }

    public Page<PaymentTransactionResponse> listTransactions(Pageable pageable) {
        String tenantId = TenantContext.requireTenantId();
        return transactionRepository.findByTenantIdOrderByCreatedAtDesc(tenantId, pageable)
                .map(this::toResponse);
    }

    public List<PaymentTransactionResponse> getForPayrollRun(UUID payrollRunId) {
        String tenantId = TenantContext.requireTenantId();
        return transactionRepository.findByTenantIdAndPayrollRunId(tenantId, payrollRunId)
                .stream().map(this::toResponse).toList();
    }

    public PaymentSummaryResponse getPayrollPaymentSummary(UUID payrollRunId) {
        String tenantId = TenantContext.requireTenantId();
        List<PaymentTransaction> all = transactionRepository
                .findByTenantIdAndPayrollRunId(tenantId, payrollRunId);

        long total = all.size();
        long completed = all.stream()
                .filter(t -> t.getStatus() == TransactionStatus.COMPLETED).count();
        long failedCount = all.stream()
                .filter(t -> t.getStatus() == TransactionStatus.FAILED).count();
        long pending = all.stream()
                .filter(t -> t.getStatus() == TransactionStatus.PENDING
                        || t.getStatus() == TransactionStatus.SUBMITTED
                        || t.getStatus() == TransactionStatus.PROCESSING).count();
        long mpesa = all.stream()
                .filter(t -> t.getPaymentMethod() == PaymentMethod.MPESA).count();
        long bank = all.stream()
                .filter(t -> t.getPaymentMethod() == PaymentMethod.BANK_TRANSFER).count();

        BigDecimal totalAmount = all.stream()
                .map(PaymentTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal completedAmount = all.stream()
                .filter(t -> t.getStatus() == TransactionStatus.COMPLETED)
                .map(PaymentTransaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new PaymentSummaryResponse(
                total, completed, failedCount, pending,
                mpesa, bank, totalAmount, completedAmount
        );
    }

    private PaymentTransactionResponse toResponse(PaymentTransaction tx) {
        return new PaymentTransactionResponse(
                tx.getId(), tx.getPayrollRunId(), tx.getPaySlipId(),
                tx.getEmployeeId(), tx.getEmployeeName(),
                tx.getPaymentMethod().name(), tx.getPhoneNumber(),
                tx.getAmount(), tx.getCurrency(), tx.getStatus().name(),
                tx.getExternalReference(), tx.getProviderReceipt(),
                tx.getErrorMessage(), tx.getSubmittedAt(), tx.getCompletedAt(),
                tx.getRetryCount()
        );
    }
}
