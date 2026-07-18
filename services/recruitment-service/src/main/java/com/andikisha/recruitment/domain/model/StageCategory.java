package com.andikisha.recruitment.domain.model;

/**
 * The semantic category of a pipeline stage. APPLIED / HIRED / REJECTED are the protected
 * anchors — they cannot be removed and their category cannot change (only the display label).
 * OFFER is a distinguished category R2 uses for the offer flow (ordinary editable stage in R1).
 * INTERMEDIATE is the generic category for Screening / Interview and any tenant-added stage.
 */
public enum StageCategory {
    APPLIED,
    INTERMEDIATE,
    OFFER,
    HIRED,
    REJECTED;

    /** Anchors are protected: cannot be deleted, category cannot change. */
    public boolean isAnchor() {
        return this == APPLIED || this == HIRED || this == REJECTED;
    }
}
