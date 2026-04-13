-- refresh_tokens extends BaseEntity which requires updated_at and version columns
ALTER TABLE refresh_tokens
    ADD COLUMN IF NOT EXISTS updated_at  TIMESTAMP NOT NULL DEFAULT NOW(),
    ADD COLUMN IF NOT EXISTS version     BIGINT    NOT NULL DEFAULT 0;
