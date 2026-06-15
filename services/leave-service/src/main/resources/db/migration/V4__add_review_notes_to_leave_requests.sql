-- LEAVE-BACKLOG-001: persist the reviewer's note.
-- The approve modal collected an optional note that was never sent or stored,
-- and the request-detail page reads `review_notes` (which never existed). This
-- adds the column; it is populated on approve (optional note) and on reject
-- (the rejection reason), so the detail view shows the reviewer's note uniformly.
ALTER TABLE leave_requests ADD COLUMN review_notes VARCHAR(1000);
