package com.andikisha.integration.infrastructure.bank;

import com.andikisha.integration.application.port.BankTransferClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class SandboxBankTransferClient implements BankTransferClient {

    private static final Logger log = LoggerFactory.getLogger(SandboxBankTransferClient.class);

    private final boolean enabled;

    public SandboxBankTransferClient(@Value("${app.bank-transfer.enabled:false}") boolean enabled) {
        this.enabled = enabled;
    }

    @Override
    public BankTransferResponse send(String bankCode, String accountNumber,
                                     String accountName, BigDecimal amount,
                                     String currency, String reference,
                                     String narration) {
        if (!enabled) {
            log.info("Bank transfer sandbox: {} to {}/{} amount {} {}",
                    reference, bankCode, accountNumber, currency, amount);
            String mockRef = "BT-" + UUID.randomUUID().toString()
                    .substring(0, 12).toUpperCase();
            return new BankTransferResponse(true, mockRef, "00", "Success");
        }

        // Production bank transfer integration options:
        //
        // Option A: Pesalink (real-time interbank transfers)
        //   POST https://api.pesalink.co.ke/api/v1/transfer
        //   Supports all Kenyan banks, real-time settlement
        //
        // Option B: IPSL (Kenya Interbank Payment System)
        //   Batch file upload for bulk salary payments
        //   Each bank has its own API for IPSL submission
        //
        // Option C: Direct bank API (per-bank integration)
        //   KCB: POST https://api.kcbbankgroup.com/payments/transfer
        //   Equity: POST https://api.equitybankgroup.com/transaction/v2/payments
        //   Co-op: POST https://developer.co-opbank.co.ke/api/payments
        //   Each bank provides their own developer portal
        //
        // Option D: Payment aggregator (Cellulant, Flutterwave, Paystack)
        //   Single API, routes to any Kenyan bank
        //   Higher per-transaction fees but simpler integration
        //
        // For MVP, Option D (aggregator) is the fastest path.
        // For scale, Option A (Pesalink) gives the best cost per transaction.

        log.warn("Production bank transfer not implemented.");
        return new BankTransferResponse(false, null, "999", "Not implemented");
    }
}