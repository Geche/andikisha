package com.andikisha.document.domain.model;

public enum DocumentStatus {
    GENERATING,
    READY,
    // Hybrid-issued documents (e.g. Certificate of Service): generated as a DRAFT, then ISSUED by
    // HR after review/branding/signature. Only ISSUED copies are delivered/downloadable (#56).
    DRAFT,
    ISSUED,
    FAILED,
    ARCHIVED
}