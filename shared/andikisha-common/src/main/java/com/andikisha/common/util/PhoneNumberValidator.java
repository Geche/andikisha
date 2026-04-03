package com.andikisha.common.util;

import java.util.regex.Pattern;

public final class PhoneNumberValidator {

    private static final Pattern KE_PHONE = Pattern.compile("^(\\+254|0)7\\d{8}$");
    private static final Pattern KE_PHONE_INTL = Pattern.compile("^\\+254\\d{9}$");

    private PhoneNumberValidator() {}

    public static boolean isValidKenyan(String phone) {
        if (phone == null || phone.isBlank()) return false;
        return KE_PHONE.matcher(phone.trim()).matches();
    }

    public static String normalizeToInternational(String phone) {
        if (phone == null) return null;
        String cleaned = phone.trim().replaceAll("[\\s-]", "");
        if (cleaned.startsWith("0")) {
            return "+254" + cleaned.substring(1);
        }
        if (cleaned.startsWith("254") && !cleaned.startsWith("+254")) {
            return "+" + cleaned;
        }
        return cleaned;
    }
}