package com.andikisha.employee.application.dto.request;

import java.util.UUID;

/**
 * Optional body for completing a task. documentId links a DOCUMENT_UPLOAD task to
 * the uploaded document (owned by document-service; a UUID reference only, no FK).
 */
public record CompleteTaskRequest(
        UUID documentId
) {}
