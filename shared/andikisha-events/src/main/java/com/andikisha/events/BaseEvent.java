package com.andikisha.events;

import com.fasterxml.jackson.annotation.JsonTypeInfo;

import java.time.Instant;
import java.util.UUID;

@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, property = "@class")
public abstract class BaseEvent {

    private final String eventId;
    private final String eventType;
    private final String tenantId;
    private final Instant timestamp;

    protected BaseEvent(String eventType, String tenantId) {
        this.eventId = UUID.randomUUID().toString();
        this.eventType = eventType;
        this.tenantId = tenantId;
        this.timestamp = Instant.now();
    }

    // Jackson deserialization
    protected BaseEvent() {
        this.eventId = null;
        this.eventType = null;
        this.tenantId = null;
        this.timestamp = null;
    }

    public String getEventId() { return eventId; }
    public String getEventType() { return eventType; }
    public String getTenantId() { return tenantId; }
    public Instant getTimestamp() { return timestamp; }

    @Override
    public String toString() {
        return getClass().getSimpleName()
                + "{eventId=" + eventId
                + ", eventType=" + eventType
                + ", tenantId=" + tenantId
                + ", timestamp=" + timestamp + "}";
    }
}