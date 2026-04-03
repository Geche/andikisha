package com.andikisha.common.exception;

import java.util.UUID;

public class ResourceNotFoundException extends RuntimeException {

    private final String resourceName;
    private final String identifier;

    public ResourceNotFoundException(String resourceName, UUID id) {
        super(resourceName + " not found with id: " + id);
        this.resourceName = resourceName;
        this.identifier = id.toString();
    }

    public ResourceNotFoundException(String resourceName, String identifier) {
        super(resourceName + " not found with identifier: " + identifier);
        this.resourceName = resourceName;
        this.identifier = identifier;
    }

    public String getResourceName() {
        return resourceName;
    }

    public String getIdentifier() {
        return identifier;
    }
}