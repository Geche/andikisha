-- V18: give the standalone demo admin a human display name.
--
-- admin@demo.co.ke is a standalone admin (no employee record), so AUTH-006's
-- employee-resolved display_name never populates for it and the chip/profile fall back to
-- the email. Set a friendly name directly. Scoped to the demo account by email, so this is a
-- no-op in any environment where that account doesn't exist (e.g. production). Only sets it
-- when still null, so a later real value is never overwritten.

UPDATE users
   SET display_name = 'Andikisha Admin'
 WHERE email = 'admin@demo.co.ke'
   AND display_name IS NULL;
