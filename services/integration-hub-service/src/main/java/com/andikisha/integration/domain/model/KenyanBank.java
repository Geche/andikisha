package com.andikisha.integration.domain.model;

import java.util.LinkedHashMap;
import java.util.Map;

public final class KenyanBank {

    private KenyanBank() {}

    // LinkedHashMap preserves insertion order, ensuring longer keys (e.g. "DIAMOND TRUST")
    // are matched before shorter aliases (e.g. "DTB") for deterministic resolution.
    private static final Map<String, String> BANK_CODES;
    static {
        BANK_CODES = new LinkedHashMap<>();
        BANK_CODES.put("STANDARD CHARTERED", "02");
        BANK_CODES.put("DIAMOND TRUST", "54");
        BANK_CODES.put("BANK OF AFRICA", "19");
        BANK_CODES.put("NATIONAL BANK", "12");
        BANK_CODES.put("GUARANTY TRUST", "53");
        BANK_CODES.put("VICTORIA COMMERCIAL", "29");
        BANK_CODES.put("FAMILY BANK", "70");
        BANK_CODES.put("CO-OPERATIVE", "11");
        BANK_CODES.put("GUARDIAN BANK", "55");
        BANK_CODES.put("CREDIT BANK", "25");
        BANK_CODES.put("PRIME BANK", "10");
        BANK_CODES.put("SPIRE BANK", "49");
        BANK_CODES.put("KCB", "01");
        BANK_CODES.put("BARCLAYS", "03");
        BANK_CODES.put("ABSA", "03");
        BANK_CODES.put("I&M", "04");
        BANK_CODES.put("NCBA", "07");
        BANK_CODES.put("CO-OP", "11");
        BANK_CODES.put("EQUITY", "68");
        BANK_CODES.put("STANBIC", "31");
        BANK_CODES.put("DTB", "54");
        BANK_CODES.put("SIDIAN", "66");
        BANK_CODES.put("GTB", "53");
        BANK_CODES.put("ECOBANK", "43");
        BANK_CODES.put("CITIBANK", "16");
        BANK_CODES.put("HFC", "08");
    }

    public static String resolveCode(String bankName) {
        if (bankName == null) return null;
        String normalized = bankName.toUpperCase().trim();
        for (var entry : BANK_CODES.entrySet()) {
            if (normalized.contains(entry.getKey())) {
                return entry.getValue();
            }
        }
        return null;
    }

    public static boolean isValidBank(String bankName) {
        return resolveCode(bankName) != null;
    }
}