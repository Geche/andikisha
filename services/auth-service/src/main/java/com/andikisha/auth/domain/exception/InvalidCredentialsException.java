package com.andikisha.auth.domain.exception;

public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException() {
        // Deliberately vague for login to prevent account enumeration.
        super("Invalid email or password");
    }

    public InvalidCredentialsException(String message) {
        super(message);
    }
}