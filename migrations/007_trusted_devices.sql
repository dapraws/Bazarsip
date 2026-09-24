-- "Ingat perangkat ini" for two-factor sign-in.
--
-- Asking for a code on every sign-in from the phone the seller always uses is
-- the friction that makes people turn two-factor off. Remembering a device
-- for 30 days keeps the protection where it matters (a new browser, someone
-- else's machine) and removes it where it never helped.
--
-- The token is stored hashed, exactly like a password: it bypasses the second
-- factor, so a leaked database must not hand anyone a working device.
--
-- Apply:
--   psql -h localhost -p 5433 -U postgres -d bazarsip -f migrations/007_trusted_devices.sql

BEGIN;

CREATE TABLE IF NOT EXISTS trusted_devices (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash TEXT NOT NULL,
    label VARCHAR(120),
    expires_at TIMESTAMP NOT NULL,
    last_used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trusted_devices_user ON trusted_devices(user_id);
CREATE INDEX IF NOT EXISTS idx_trusted_devices_expires ON trusted_devices(expires_at);

COMMIT;
