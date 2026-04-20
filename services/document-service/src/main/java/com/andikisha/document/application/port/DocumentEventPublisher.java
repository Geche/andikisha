package com.andikisha.document.application.port;

import com.andikisha.document.domain.model.Document;

public interface DocumentEventPublisher {

    void publishDocumentReady(Document document);
}