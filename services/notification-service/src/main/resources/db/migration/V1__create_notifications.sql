CREATE TABLE notifications (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id           VARCHAR(50) NOT NULL,
    recipient_id        UUID NOT NULL,
    recipient_email     VARCHAR(255),
    recipient_phone     VARCHAR(20),
    recipient_name      VARCHAR(200),
    channel             VARCHAR(10) NOT NULL,
    priority            VARCHAR(10) NOT NULL DEFAULT 'NORMAL',
    category            VARCHAR(50) NOT NULL,
    subject             VARCHAR(255),
    body                TEXT NOT NULL,
    status              VARCHAR(10) NOT NULL DEFAULT 'PENDING',
    sent_at             TIMESTAMP,
    error_message       VARCHAR(1000),
    retry_count         INTEGER NOT NULL DEFAULT 0,
    max_retries         INTEGER NOT NULL DEFAULT 3,
    source_event_id     VARCHAR(100),
    source_event_type   VARCHAR(100),
    created_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP NOT NULL DEFAULT NOW(),
    version             BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_notifications_tenant ON notifications(tenant_id);
CREATE INDEX idx_notifications_recipient ON notifications(tenant_id, recipient_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_category ON notifications(tenant_id, category);
CREATE INDEX idx_notifications_created ON notifications(tenant_id, created_at DESC);