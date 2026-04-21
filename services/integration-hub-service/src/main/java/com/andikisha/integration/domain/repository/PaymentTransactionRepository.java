package com.andikisha.integration.domain.repository;

import com.andikisha.integration.domain.model.PaymentTransaction;
import com.andikisha.integration.domain.model.TransactionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentTransactionRepository
        extends JpaRepository<PaymentTransaction, UUID> {

    Optional<PaymentTransaction> findByIdAndTenantId(UUID id, String tenantId);

    List<PaymentTransaction> findByTenantIdAndPayrollRunId(
            String tenantId, UUID payrollRunId);

    Page<PaymentTransaction> findByTenantIdOrderByCreatedAtDesc(
            String tenantId, Pageable pageable);

    Optional<PaymentTransaction> findByConversationId(String conversationId);

    List<PaymentTransaction> findByTenantIdAndPayrollRunIdAndStatus(
            String tenantId, UUID payrollRunId, TransactionStatus status);

    long countByTenantIdAndPayrollRunIdAndStatus(
            String tenantId, UUID payrollRunId, TransactionStatus status);
}