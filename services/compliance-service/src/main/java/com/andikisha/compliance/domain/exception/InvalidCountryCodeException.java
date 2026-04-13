package com.andikisha.compliance.domain.exception;

public class InvalidCountryCodeException extends IllegalArgumentException {

    public InvalidCountryCodeException(String countryCode) {
        super("Unsupported country code: " + countryCode);
    }
}
