package com.andikisha.audit.domain.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "audit_entries")
public class AuditEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "tenant_id", nullable = false, length = 50)
    private String tenantId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuditDomain domain;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuditAction action;

    @Column(name = "resource_type", nullable = false, length = 50)
    private String resourceType;

    @Column(name = "resource_id", length = 100)
    private String resourceId;

    @Column(name = "actor_id", length = 100)
    private String actorId;

    @Column(name = "actor_name", length = 200)
    private String actorName;

    @Column(name = "actor_role", length = 30)
    private String actorRole;

    @Column(length = 500)
    private String description;

    @Column(name = "event_type", nullable = false, length = 100)
    private String eventType;

    @Column(name = "event_id", length = 100)
    private String eventId;

    @Column(name = "event_data", columnDefinition = "TEXT")
    private String eventData;

    @Column(name = "ip_address", length = 45)
    private String ipAddress;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    @Column(name = "recorded_at", nullable = false)
    private Instant recordedAt;

    protected AuditEntry() {}

    public static AuditEntry record(String tenantId, AuditDomain domain,
                                    AuditAction action, String resourceType,
                                    String resourceId, String actorId,
                                    String actorName, String description,
                                    String eventType, String eventId,
                                    String eventData, Instant occurredAt) {
        AuditEntry entry = new AuditEntry();
        entry.tenantId = tenantId;
        entry.domain = domain;
        entry.action = action;
        entry.resourceType = resourceType;
        entry.resourceId = resourceId;
        entry.actorId = actorId;
        entry.actorName = actorName;
        entry.description = description;
        entry.eventType = eventType;
        entry.eventId = eventId;
        entry.eventData = eventData;
        entry.occurredAt = occurredAt;
        entry.recordedAt = Instant.now();
        return entry;
    }

    // Immutable: no setters except for fields set at creation

    public UUID getId() { return id; }
    public String getTenantId() { return tenantId; }
    public AuditDomain getDomain() { return domain; }
    public AuditAction getAction() { return action; }
    public String getResourceType() { return resourceType; }
    public String getResourceId() { return resourceId; }
    public String getActorId() { return actorId; }
    public String getActorName() { return actorName; }
    public String getActorRole() { return actorRole; }
    public String getDescription() { return description; }
    public String getEventType() { return eventType; }
    public String getEventId() { return eventId; }
    public String getEventData() { return eventData; }
    public String getIpAddress() { return ipAddress; }
    public Instant getOccurredAt() { return occurredAt; }
    public Instant getRecordedAt() { return recordedAt; }
}