package com.andikisha.integration.unit;

import com.andikisha.common.exception.BusinessRuleException;
import com.andikisha.integration.application.port.IntegrationEventPublisher;
import com.andikisha.integration.application.service.PaymentService;
import com.andikisha.integration.domain.model.PaymentMethod;
import com.andikisha.integration.domain.model.PaymentTransaction;
import com.andikisha.integration.domain.model.TransactionStatus;
import com.andikisha.integration.domain.repository.PaymentTransactionRepository;
import com.andikisha.integration.infrastructure.messaging.PaymentProcessor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    private static final String TENANT_ID  = "tenant-test";
    private static final UUID   RUN_ID     = UUID.randomUUID();
    private static final String CONV_ID    = "AG_TESTCONV123456";
    private static final String LOCK_KEY   = "lock:disburse:" + TENANT_ID + ":" + RUN_ID;
    private static final String IDEM_KEY   = "mpesa:callback:" + CONV_ID;

    @Mock PaymentTransactionRepository transactionRepository;
    @Mock PaymentProcessor             paymentProcessor;
    @Mock IntegrationEventPublisher    eventPublisher;
    @Mock StringRedisTemplate          redisTemplate;
    @Mock ValueOperations<String, String> valueOps;

    private PaymentService service;

    @BeforeEach
    void setUp() {
        lenient().when(redisTemplate.opsForValue()).thenReturn(valueOps);
        service = new PaymentService(
                transactionRepository, paymentProcessor, eventPublisher, redisTemplate);
    }

    // -------------------------------------------------------------------------
    // processBatchPayments
    // -------------------------------------------------------------------------

    @Test
    void processBatchPayments_acquiresLockAndDispatchesEachPendingTransaction() {
        when(valueOps.setIfAbsent(eq(LOCK_KEY), anyString(), any())).thenReturn(true);

        PaymentTransaction tx1 = buildTransaction(PaymentMethod.MPESA);
        PaymentTransaction tx2 = buildTransaction(PaymentMethod.BANK_TRANSFER);
        when(transactionRepository.findByTenantIdAndPayrollRunIdAndStatus(
                TENANT_ID, RUN_ID, TransactionStatus.PENDING))
                .thenReturn(List.of(tx1, tx2));

        service.processBatchPayments(TENANT_ID, RUN_ID);

        verify(paymentProcessor).processPayment(tx1.getId(), TENANT_ID);
        verify(paymentProcessor).processPayment(tx2.getId(), TENANT_ID);
        verify(redisTemplate).delete(LOCK_KEY);
    }

    @Test
    void processBatchPayments_throwsWhenLockAlreadyHeld() {
        when(valueOps.setIfAbsent(eq(LOCK_KEY), anyString(), any())).thenReturn(false);

        assertThatThrownBy(() -> service.processBatchPayments(TENANT_ID, RUN_ID))
                .isInstanceOf(BusinessRuleException.class)
                .hasMessageContaining("already in progress");

        verify(paymentProcessor, never()).processPayment(any(), any());
    }

    @Test
    void processBatchPayments_releasesLockEvenWhenExceptionThrown() {
        when(valueOps.setIfAbsent(eq(LOCK_KEY), anyString(), any())).thenReturn(true);
        when(transactionRepository.findByTenantIdAndPayrollRunIdAndStatus(
                any(), any(), any()))
                .thenThrow(new RuntimeException("DB error"));

        assertThatThrownBy(() -> service.processBatchPayments(TENANT_ID, RUN_ID));
        verify(redisTemplate).delete(LOCK_KEY);
    }

    // -------------------------------------------------------------------------
    // handleMpesaCallback
    // -------------------------------------------------------------------------

    @Test
    void handleMpesaCallback_successWithReceipt_completesTransaction() {
        when(valueOps.setIfAbsent(eq(IDEM_KEY), anyString(), any())).thenReturn(true);
        PaymentTransaction tx = buildTransaction(PaymentMethod.MPESA);
        when(transactionRepository.findByConversationId(CONV_ID)).thenReturn(Optional.of(tx));

        service.handleMpesaCallback(CONV_ID, true, "QGH7YK3BXY", null, null);

        assertThat(tx.getStatus()).isEqualTo(TransactionStatus.COMPLETED);
        assertThat(tx.getProviderReceipt()).isEqualTo("QGH7YK3BXY");
        verify(eventPublisher).publishPaymentCompleted(tx);
        verify(transactionRepository).save(tx);
    }

    @Test
    void handleMpesaCallback_successWithNullReceipt_marksFailedAndPublishesFailedEvent() {
        when(valueOps.setIfAbsent(eq(IDEM_KEY), anyString(), any())).thenReturn(true);
        PaymentTransaction tx = buildTransaction(PaymentMethod.MPESA);
        when(transactionRepository.findByConversationId(CONV_ID)).thenReturn(Optional.of(tx));

        service.handleMpesaCallback(CONV_ID, true, null, null, null);

        assertThat(tx.getStatus()).isEqualTo(TransactionStatus.FAILED);
        verify(eventPublisher).publishPaymentFailed(tx);
        verify(eventPublisher, never()).publishPaymentCompleted(any());
    }

    @Test
    void handleMpesaCallback_failure_marksFailedWithErrorCode() {
        when(valueOps.setIfAbsent(eq(IDEM_KEY), anyString(), any())).thenReturn(true);
        PaymentTransaction tx = buildTransaction(PaymentMethod.MPESA);
        when(transactionRepository.findByConversationId(CONV_ID)).thenReturn(Optional.of(tx));

        service.handleMpesaCallback(CONV_ID, false, null, "2001", "Insufficient funds");

        assertThat(tx.getStatus()).isEqualTo(TransactionStatus.FAILED);
        verify(eventPublisher).publishPaymentFailed(tx);
    }

    @Test
    void handleMpesaCallback_duplicateCallback_isIgnoredAndNotReprocessed() {
        when(valueOps.setIfAbsent(eq(IDEM_KEY), anyString(), any())).thenReturn(false);

        service.handleMpesaCallback(CONV_ID, true, "QGH7YK3BXY", null, null);

        verify(transactionRepository, never()).findByConversationId(any());
        verify(transactionRepository, never()).save(any());
    }

    @Test
    void handleMpesaCallback_unknownConversationId_logsAndReturnsGracefully() {
        when(valueOps.setIfAbsent(eq(IDEM_KEY), anyString(), any())).thenReturn(true);
        when(transactionRepository.findByConversationId(CONV_ID)).thenReturn(Optional.empty());

        service.handleMpesaCallback(CONV_ID, true, "QGH7YK3BXY", null, null);

        verify(transactionRepository, never()).save(any());
        verify(eventPublisher, never()).publishPaymentCompleted(any());
    }

    // -------------------------------------------------------------------------
    // listTransactions
    // -------------------------------------------------------------------------

    @Test
    void listTransactions_returnsPagedResponseForTenant() {
        com.andikisha.common.tenant.TenantContext.setTenantId(TENANT_ID);
        try {
            PaymentTransaction tx = buildTransaction(PaymentMethod.MPESA);
            when(transactionRepository.findByTenantIdOrderByCreatedAtDesc(
                    eq(TENANT_ID), any()))
                    .thenReturn(new PageImpl<>(List.of(tx)));

            var page = service.listTransactions(PageRequest.of(0, 10));

            assertThat(page.getTotalElements()).isEqualTo(1);
        } finally {
            com.andikisha.common.tenant.TenantContext.clear();
        }
    }

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    private PaymentTransaction buildTransaction(PaymentMethod method) {
        PaymentTransaction tx = PaymentTransaction.create(
                TENANT_ID, RUN_ID, UUID.randomUUID(), UUID.randomUUID(),
                "Test Employee", method,
                method == PaymentMethod.MPESA ? "+254700000001" : null,
                method == PaymentMethod.BANK_TRANSFER ? "KCB" : null,
                method == PaymentMethod.BANK_TRANSFER ? "1234567890" : null,
                new BigDecimal("50000.00"), "KES");
        ReflectionTestUtils.setField(tx, "id", UUID.randomUUID());
        if (method == PaymentMethod.MPESA) {
            tx.markSubmitted("PAY-ABC12345", CONV_ID);
        }
        return tx;
    }
}
