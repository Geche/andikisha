package com.andikisha.events.document;

import com.andikisha.events.BaseEvent;

public class DocumentGeneratedEvent extends BaseEvent {

    private String documentId;
    private String documentType;
    private String employeeId;

    public DocumentGeneratedEvent(String tenantId, String documentId,
                                  String documentType, String employeeId) {
        super("document.generated", tenantId);
        this.documentId = documentId;
        this.documentType = documentType;
        this.employeeId = employeeId;
    }

    protected DocumentGeneratedEvent() { super(); }

    public String getDocumentId() { return documentId; }
    public String getDocumentType() { return documentType; }
    public String getEmployeeId() { return employeeId; }
}