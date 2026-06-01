package com.andikisha.common.scope;

public class DepartmentScopeException extends RuntimeException {

    public DepartmentScopeException() {
        super("Your account does not have a department assigned. Contact your administrator.");
    }

    public DepartmentScopeException(String message) {
        super(message);
    }
}
