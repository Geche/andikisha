CREATE TABLE integration_configs (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id               VARCHAR(50) NOT NULL,
    integration_type        VARCHAR(30) NOT NULL,
    api_key                 VARCHAR(500),
    api_secret              VARCHAR(500),
    shortcode               VARCHAR(20),
    initiator_name          VARCHAR(100),
    security_credential     VARCHAR(1000),
    callback_url            VARCHAR(500),
    timeout_url             VARCHAR(500),
    environment             VARCHAR(20) NOT NULL DEFAULT 'sandbox',
    is_active               BOOLEAN NOT NULL DEFAULT FALSE,
    created_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at              TIMESTAMP NOT NULL DEFAULT NOW(),
    version                 BIGINT NOT NULL DEFAULT 0,
    UNIQUE(tenant_id, integration_type)
);

CREATE INDEX idx_integration_configs_tenant ON integration_configs(tenant_id);