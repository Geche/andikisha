ALTER TABLE users
    ADD COLUMN must_change_password BOOLEAN NOT NULL DEFAULT TRUE;

-- Existing active admin/superadmin accounts already have real passwords; don't lock them out.
UPDATE users SET must_change_password = FALSE WHERE role = 'ADMIN' OR role = 'SUPER_ADMIN';
