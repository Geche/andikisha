package com.andikisha.common.exception;

public class ImpersonationNotPermittedException extends RuntimeException {

    public ImpersonationNotPermittedException() {
        super("Write operations are not permitted during tenant impersonation sessions.");
    }
}
