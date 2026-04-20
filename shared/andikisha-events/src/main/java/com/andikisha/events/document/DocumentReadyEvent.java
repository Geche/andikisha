package com.andikisha.events.document;

import com.andikisha.events.BaseEvent;

public class DocumentReadyEvent extends BaseEvent {

    private final String documentId;
    private final String employeeId;
    private final String documentType;
    private final String fileName;
    private final String period;

    public DocumentReadyEvent(String tenantId, String documentId, String employeeId,
                               String documentType, String fileName, String period) {
        super("document.ready", tenantId);
        this.documentId   = documentId;
        this.employeeId   = employeeId;
        this.documentType = documentType;
        this.fileName     = fileName;
        this.period       = period;
    }

    protected DocumentReadyEvent() {
        super();
        this.documentId = null; this.employeeId = null;
        this.documentType = null; this.fileName = null; this.period = null;
    }

    public String getDocumentId()   { return documentId; }
    public String getEmployeeId()   { return employeeId; }
    public String getDocumentType() { return documentType; }
    public String getFileName()     { return fileName; }
    public String getPeriod()       { return period; }
}
