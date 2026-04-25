package com.andikisha.events.document;

import com.andikisha.events.BaseEvent;

public class DocumentReadyEvent extends BaseEvent {

    private String documentId;
    private String employeeId;
    private String documentType;
    private String fileName;
    private String period;

    public DocumentReadyEvent(String tenantId, String documentId, String employeeId,
                               String documentType, String fileName, String period) {
        super("document.ready", tenantId);
        this.documentId   = documentId;
        this.employeeId   = employeeId;
        this.documentType = documentType;
        this.fileName     = fileName;
        this.period       = period;
    }

    protected DocumentReadyEvent() { super(); }

    public String getDocumentId()   { return documentId; }
    public String getEmployeeId()   { return employeeId; }
    public String getDocumentType() { return documentType; }
    public String getFileName()     { return fileName; }
    public String getPeriod()       { return period; }
}
