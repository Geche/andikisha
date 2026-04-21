package com.andikisha.integration.application.port;

import java.math.BigDecimal;

public interface BankTransferClient {

    BankTransferResponse send(String bankCode, String accountNumber,
                              String accountName, BigDecimal amount,
                              String currency, String reference,
                              String narration);

    record BankTransferResponse(
            boolean success,
            String transactionReference,
            String responseCode,
            String responseDescription
    ) {}
}