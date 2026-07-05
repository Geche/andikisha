package com.andikisha.events.document;

import com.andikisha.events.BaseEvent;

public class DocumentReadyEvent extends BaseEvent {

    private String documentId;
    private String employeeId;
    private String documentType;
    private String fileName;
    private String period;
    // Optional: the address to deliver the document to (e.g. an ex-employee's personal email for a
    // Certificate of Service, #54). Null for documents that are not delivered by email.
    private String recipientEmail;

    public DocumentReadyEvent(String tenantId, String documentId, String employeeId,
                               String documentType, String fileName, String period) {
        this(tenantId, documentId, employeeId, documentType, fileName, period, null);
    }

    public DocumentReadyEvent(String tenantId, String documentId, String employeeId,
                               String documentType, String fileName, String period,
                               String recipientEmail) {
        super("document.ready", tenantId);
        this.documentId     = documentId;
        this.employeeId     = employeeId;
        this.documentType   = documentType;
        this.fileName       = fileName;
        this.period         = period;
        this.recipientEmail = recipientEmail;
    }

    protected DocumentReadyEvent() { super(); }

    public String getDocumentId()    { return documentId; }
    public String getEmployeeId()    { return employeeId; }
    public String getDocumentType()  { return documentType; }
    public String getFileName()      { return fileName; }
    public String getPeriod()        { return period; }
    public String getRecipientEmail() { return recipientEmail; }
}
