package com.andikisha.audit.application.mapper;

import com.andikisha.audit.application.dto.response.AuditEntryResponse;
import com.andikisha.audit.domain.model.AuditEntry;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AuditMapper {

    @Mapping(target = "domain", expression = "java(e.getDomain().name())")
    @Mapping(target = "action", expression = "java(e.getAction().name())")
    AuditEntryResponse toResponse(AuditEntry e);
}