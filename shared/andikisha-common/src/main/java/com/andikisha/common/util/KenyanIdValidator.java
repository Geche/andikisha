package com.andikisha.common.util;

import java.util.regex.Pattern;

public final class KenyanIdValidator {

    private static final Pattern NATIONAL_ID = Pattern.compile("^\\d{6,10}$");
    private static final Pattern KRA_PIN = Pattern.compile("^[A-Z]\\d{9}[A-Z]$");

    private KenyanIdValidator() {}

    public static boolean isValidNationalId(String id) {
        if (id == null || id.isBlank()) return false;
        return NATIONAL_ID.matcher(id.trim()).matches();
    }

    public static boolean isValidKraPin(String pin) {
        if (pin == null || pin.isBlank()) return false;
        return KRA_PIN.matcher(pin.trim().toUpperCase()).matches();
    }
}