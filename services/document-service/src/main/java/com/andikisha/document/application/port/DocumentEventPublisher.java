package com.andikisha.document.application.port;

import com.andikisha.document.domain.model.Document;

public interface DocumentEventPublisher {

    void publishDocumentReady(Document document);

    /** @param recipientEmail address to deliver the document to (e.g. #54); may be null. */
    void publishDocumentReady(Document document, String recipientEmail);
}