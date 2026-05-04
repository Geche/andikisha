package com.andikisha.audit.application.mapper;

import com.andikisha.audit.application.dto.response.AuditEntryResponse;
import com.andikisha.audit.domain.model.AuditEntry;
import java.time.Instant;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-03T19:57:09+0300",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.11 (Amazon.com Inc.)"
)
@Component
public class AuditMapperImpl implements AuditMapper {

    @Override
    public AuditEntryResponse toResponse(AuditEntry e) {
        if ( e == null ) {
            return null;
        }

        UUID id = null;
        String resourceType = null;
        String resourceId = null;
        String actorId = null;
        String actorName = null;
        String description = null;
        String eventType = null;
        Instant occurredAt = null;
        Instant recordedAt = null;

        id = e.getId();
        resourceType = e.getResourceType();
        resourceId = e.getResourceId();
        actorId = e.getActorId();
        actorName = e.getActorName();
        description = e.getDescription();
        eventType = e.getEventType();
        occurredAt = e.getOccurredAt();
        recordedAt = e.getRecordedAt();

        String domain = e.getDomain().name();
        String action = e.getAction().name();

        AuditEntryResponse auditEntryResponse = new AuditEntryResponse( id, domain, action, resourceType, resourceId, actorId, actorName, description, eventType, occurredAt, recordedAt );

        return auditEntryResponse;
    }
}
