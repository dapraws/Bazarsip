-- Two-factor authentication for staff, and a record of who changed what.
--
-- Rate limiting only slows an attacker down; a second factor means a stolen
-- password is not enough on its own. The audit log answers the other half:
-- if someone does get in, or a figure looks wrong once a helper is working
-- the shop, it shows what happened and who did it.
--
-- Apply:
--   psql -h localhost -p 5433 -U postgres -d bazarsip -f migrations/006_two_factor_and_audit_log.sql

BEGIN;

-- Base32 shared secret. Present but unverified between showing the QR and
-- the first correct code, which is why enabling is a separate flag.
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret TEXT;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS totp_enabled BOOLEAN NOT NULL DEFAULT false;

-- The last time step accepted for this user. A code is valid for about 90
-- seconds across the drift window; without this it could be replayed for
-- that whole time by anyone who saw it.
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_last_step BIGINT;

-- Bcrypt hashes, never the codes themselves: a backup that bypasses the
-- second factor deserves the same protection as the password.
ALTER TABLE users ADD COLUMN IF NOT EXISTS recovery_codes TEXT[];

CREATE TABLE IF NOT EXISTS audit_log (
    id SERIAL PRIMARY KEY,
    -- SET NULL, plus the email kept alongside: deleting the person who acted
    -- must not erase the record of what they did.
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(50),
    entity_id VARCHAR(64),
    details JSONB,
    ip VARCHAR(64),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity, entity_id);

COMMIT;
