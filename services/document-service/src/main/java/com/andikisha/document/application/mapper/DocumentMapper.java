package com.andikisha.document.application.mapper;

import com.andikisha.document.application.dto.response.DocumentResponse;
import com.andikisha.document.domain.model.Document;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface DocumentMapper {

    @Mapping(target = "documentType", expression = "java(d.getDocumentType().name())")
    @Mapping(target = "status", expression = "java(d.getStatus().name())")
    DocumentResponse toResponse(Document d);
}