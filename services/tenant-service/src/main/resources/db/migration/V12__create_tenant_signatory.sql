-- Authorized signatory for issued documents (one per tenant): the name and title that appear
-- on a Certificate of Service, plus a signature image embedded on the letterhead (#58). HR
-- authorizes issuance via the Issue action; this record supplies the printed signatory block.
CREATE TABLE tenant_signatory (
    tenant_id               VARCHAR(50)  PRIMARY KEY,
    signatory_name          VARCHAR(200) NOT NULL,
    signatory_title         VARCHAR(200) NOT NULL,
    signature_content_type  VARCHAR(100) NOT NULL,
    signature_data          BYTEA        NOT NULL,
    updated_at              TIMESTAMP    NOT NULL DEFAULT NOW()
);
