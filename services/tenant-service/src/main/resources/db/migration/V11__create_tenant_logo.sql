-- Tenant company logo (one per tenant), stored out-of-line from the tenants table so the
-- blob is never loaded on ordinary tenant queries. Used for document branding — e.g. the
-- Certificate of Service letterhead (#57). Small images only (see app-level size cap).
CREATE TABLE tenant_logo (
    tenant_id     VARCHAR(50)  PRIMARY KEY,
    content_type  VARCHAR(100) NOT NULL,
    data          BYTEA        NOT NULL,
    file_size     BIGINT       NOT NULL,
    updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);
