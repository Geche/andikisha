package com.andikisha.document.domain.model;

import com.andikisha.common.domain.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "documents")
public class Document extends BaseEntity {

    @Column(name = "employee_id")
    private UUID employeeId;

    @Column(name = "employee_name", length = 200)
    private String employeeName;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 30)
    private DocumentType documentType;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(name = "file_name", nullable = false, length = 255)
    private String fileName;

    @Column(name = "file_path", nullable = false, length = 1000)
    private String filePath;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 15)
    private DocumentStatus status;

    @Column(length = 20)
    private String period;

    @Column(name = "payroll_run_id")
    private UUID payrollRunId;

    @Column(name = "generated_by", length = 100)
    private String generatedBy;

    @Column(name = "generated_at")
    private LocalDateTime generatedAt;

    @Column(name = "error_message", length = 1000)
    private String errorMessage;

    protected Document() {}

    public static Document create(String tenantId, UUID employeeId,
                                  String employeeName, DocumentType documentType,
                                  String title, String fileName, String filePath,
                                  String contentType) {
        Document doc = new Document();
        doc.setTenantId(tenantId);
        doc.employeeId = employeeId;
        doc.employeeName = employeeName;
        doc.documentType = documentType;
        doc.title = title;
        doc.fileName = fileName;
        doc.filePath = filePath;
        doc.contentType = contentType;
        doc.status = DocumentStatus.GENERATING;
        return doc;
    }

    public void markReady(long fileSize) {
        this.status = DocumentStatus.READY;
        this.fileSize = fileSize;
        this.generatedAt = LocalDateTime.now();
    }

    public void markFailed(String error) {
        this.status = DocumentStatus.FAILED;
        this.errorMessage = error;
    }

    public void archive() {
        this.status = DocumentStatus.ARCHIVED;
    }

    public void setPeriod(String period) { this.period = period; }
    public void setPayrollRunId(UUID payrollRunId) { this.payrollRunId = payrollRunId; }
    public void setGeneratedBy(String generatedBy) { this.generatedBy = generatedBy; }

    public UUID getEmployeeId() { return employeeId; }
    public String getEmployeeName() { return employeeName; }
    public DocumentType getDocumentType() { return documentType; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public String getFileName() { return fileName; }
    public String getFilePath() { return filePath; }
    public Long getFileSize() { return fileSize; }
    public String getContentType() { return contentType; }
    public DocumentStatus getStatus() { return status; }
    public String getPeriod() { return period; }
    public UUID getPayrollRunId() { return payrollRunId; }
    public String getGeneratedBy() { return generatedBy; }
    public LocalDateTime getGeneratedAt() { return generatedAt; }
    public String getErrorMessage() { return errorMessage; }
}