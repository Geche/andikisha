package com.andikisha.integration.unit;

import com.andikisha.integration.application.port.BankTransferClient;
import com.andikisha.integration.application.port.IntegrationEventPublisher;
import com.andikisha.integration.application.port.MpesaClient;
import com.andikisha.integration.domain.model.IntegrationConfig;
import com.andikisha.integration.domain.model.IntegrationType;
import com.andikisha.integration.domain.model.PaymentMethod;
import com.andikisha.integration.domain.model.PaymentTransaction;
import com.andikisha.integration.domain.model.TransactionStatus;
import com.andikisha.integration.domain.repository.IntegrationConfigRepository;
import com.andikisha.integration.domain.repository.PaymentTransactionRepository;
import com.andikisha.integration.infrastructure.messaging.PaymentProcessor;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InOrder;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.PlatformTransactionManager;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * H3: {@code processPayment} must claim a transaction PENDING -> PROCESSING before any external
 * send, so a re-triggered disbursement or a duplicate dispatch finds a non-PENDING row and does not
 * send the same payment twice. The run-scoped Redis lock is released as soon as the async loop
 * returns, so this per-transaction claim is the actual double-send guard.
 */
@ExtendWith(MockitoExtension.class)
class PaymentProcessorTest {

    private static final String TENANT_ID = "tenant-test";

    @Mock PaymentTransactionRepository transactionRepository;
    @Mock IntegrationConfigRepository configRepository;
    @Mock MpesaClient mpesaClient;
    @Mock BankTransferClient bankTransferClient;
    @Mock IntegrationEventPublisher eventPublisher;
    @Mock PlatformTransactionManager transactionManager;

    private PaymentProcessor processor;

    @BeforeEach
    void setUp() {
        processor = new PaymentProcessor(transactionRepository, configRepository, mpesaClient,
                bankTransferClient, eventPublisher, transactionManager, true); // mpesaEnabled (non-sandbox)
    }

    @Test
    void processPayment_transactionAlreadySubmitted_isNotResent() {
        PaymentTransaction tx = pendingMpesaTx();
        tx.markSubmitted("PAY-1", "AG_CONV1"); // already dispatched — SUBMITTED, not PENDING
        UUID id = (UUID) ReflectionTestUtils.getField(tx, "id");
        when(transactionRepository.findByIdAndTenantId(id, TENANT_ID)).thenReturn(Optional.of(tx));

        processor.processPayment(id, TENANT_ID);

        verify(mpesaClient, never()).sendB2C(any(), any(), any(), any(), any(), any(), any(), any(), any());
        verify(transactionRepository, never()).saveAndFlush(any());
        assertThat(tx.getStatus()).isEqualTo(TransactionStatus.SUBMITTED);
    }

    @Test
    void processPayment_pendingTransaction_claimsProcessingBeforeSending() {
        PaymentTransaction tx = pendingMpesaTx(); // PENDING
        UUID id = (UUID) ReflectionTestUtils.getField(tx, "id");
        when(transactionRepository.findByIdAndTenantId(id, TENANT_ID)).thenReturn(Optional.of(tx));
        IntegrationConfig config = mock(IntegrationConfig.class);
        when(configRepository.findByTenantIdAndIntegrationTypeAndActiveTrue(
                TENANT_ID, IntegrationType.MPESA_B2C)).thenReturn(Optional.of(config));
        when(mpesaClient.sendB2C(any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new MpesaClient.MpesaResponse(true, "AG_CONV1", "orig", "0", "ok"));

        processor.processPayment(id, TENANT_ID);

        // The PENDING -> PROCESSING claim (saveAndFlush) must happen BEFORE the B2C send.
        InOrder ordered = inOrder(transactionRepository, mpesaClient);
        ordered.verify(transactionRepository).saveAndFlush(tx);
        ordered.verify(mpesaClient).sendB2C(any(), any(), any(), any(), any(), any(), any(), any(), any());
    }

    @Test
    void processPayment_failedRetryableTransaction_isReclaimedAndResent() {
        // retryFailed() re-dispatches FAILED/TIMEOUT transactions — the guard must NOT block those,
        // only in-flight/settled ones (SUBMITTED/PROCESSING/COMPLETED/REVERSED).
        PaymentTransaction tx = pendingMpesaTx();
        tx.markFailed("2001", "previous failure"); // FAILED, retryable
        UUID id = (UUID) ReflectionTestUtils.getField(tx, "id");
        when(transactionRepository.findByIdAndTenantId(id, TENANT_ID)).thenReturn(Optional.of(tx));
        IntegrationConfig config = mock(IntegrationConfig.class);
        when(configRepository.findByTenantIdAndIntegrationTypeAndActiveTrue(
                TENANT_ID, IntegrationType.MPESA_B2C)).thenReturn(Optional.of(config));
        when(mpesaClient.sendB2C(any(), any(), any(), any(), any(), any(), any(), any(), any()))
                .thenReturn(new MpesaClient.MpesaResponse(true, "AG_CONV2", "orig", "0", "ok"));

        processor.processPayment(id, TENANT_ID);

        verify(transactionRepository).saveAndFlush(tx);
        verify(mpesaClient).sendB2C(any(), any(), any(), any(), any(), any(), any(), any(), any());
    }

    private PaymentTransaction pendingMpesaTx() {
        PaymentTransaction tx = PaymentTransaction.create(
                TENANT_ID, UUID.randomUUID(), UUID.randomUUID(), UUID.randomUUID(),
                "Jane", PaymentMethod.MPESA, "+254700000001", null, null,
                new BigDecimal("50000.00"), "KES");
        ReflectionTestUtils.setField(tx, "id", UUID.randomUUID());
        return tx;
    }
}
