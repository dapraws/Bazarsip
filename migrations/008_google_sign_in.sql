-- Sign in with Google.
--
-- Customers arrive from a WhatsApp link and are asked to invent a password
-- before they can buy anything. Most Indonesian shoppers already have a
-- Google account, so letting them use it removes the step that loses them.
--
-- Apply:
--   psql -h localhost -p 5433 -U postgres -d bazarsip -f migrations/008_google_sign_in.sql

BEGIN;

-- Google's stable subject id, not the email. Emails change and can be
-- reassigned; the subject does not.
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(64);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id
  ON users(google_id) WHERE google_id IS NOT NULL;

-- An account created through Google has no password, and never gets a
-- placeholder hash: a row that looks like it has a password invites code
-- that treats it as one.
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;

COMMIT;
