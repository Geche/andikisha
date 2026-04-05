package com.andikisha.auth.application.validation;

import com.andikisha.auth.application.dto.request.ChangePasswordRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class PasswordsNotSameValidator
        implements ConstraintValidator<PasswordsNotSame, ChangePasswordRequest> {

    @Override
    public boolean isValid(ChangePasswordRequest request, ConstraintValidatorContext context) {
        if (request.currentPassword() == null || request.newPassword() == null) return true;
        return !request.newPassword().equals(request.currentPassword());
    }
}
