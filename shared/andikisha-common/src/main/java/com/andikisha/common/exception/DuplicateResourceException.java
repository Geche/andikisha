package com.andikisha.common.exception;

public class DuplicateResourceException extends RuntimeException {

    private final String resourceName;
    private final String field;
    private final String value;

    public DuplicateResourceException(String resourceName, String field, String value) {
        super(resourceName + " already exists with " + field + ": " + value);
        this.resourceName = resourceName;
        this.field = field;
        this.value = value;
    }

    public String getResourceName() { return resourceName; }
    public String getField() { return field; }
    public String getValue() { return value; }
}