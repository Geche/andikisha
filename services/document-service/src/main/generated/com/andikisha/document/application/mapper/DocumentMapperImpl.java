package com.andikisha.document.application.mapper;

import com.andikisha.document.application.dto.response.DocumentResponse;
import com.andikisha.document.domain.model.Document;
import java.time.LocalDateTime;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-05-03T19:57:05+0300",
    comments = "version: 1.6.3, compiler: javac, environment: Java 21.0.11 (Amazon.com Inc.)"
)
@Component
public class DocumentMapperImpl implements DocumentMapper {

    @Override
    public DocumentResponse toResponse(Document d) {
        if ( d == null ) {
            return null;
        }

        UUID id = null;
        UUID employeeId = null;
        String employeeName = null;
        String title = null;
        String fileName = null;
        Long fileSize = null;
        String contentType = null;
        String period = null;
        UUID payrollRunId = null;
        String generatedBy = null;
        LocalDateTime generatedAt = null;
        LocalDateTime createdAt = null;

        id = d.getId();
        employeeId = d.getEmployeeId();
        employeeName = d.getEmployeeName();
        title = d.getTitle();
        fileName = d.getFileName();
        fileSize = d.getFileSize();
        contentType = d.getContentType();
        period = d.getPeriod();
        payrollRunId = d.getPayrollRunId();
        generatedBy = d.getGeneratedBy();
        generatedAt = d.getGeneratedAt();
        createdAt = d.getCreatedAt();

        String documentType = d.getDocumentType().name();
        String status = d.getStatus().name();

        DocumentResponse documentResponse = new DocumentResponse( id, employeeId, employeeName, documentType, title, fileName, fileSize, contentType, status, period, payrollRunId, generatedBy, generatedAt, createdAt );

        return documentResponse;
    }
}
