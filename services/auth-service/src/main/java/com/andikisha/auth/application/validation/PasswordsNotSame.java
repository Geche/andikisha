package com.andikisha.auth.application.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = PasswordsNotSameValidator.class)
public @interface PasswordsNotSame {
    String message() default "New password must be different from the current password";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
