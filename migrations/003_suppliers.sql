-- Suppliers, and where each product comes from.
--
-- The seller restocks from many suppliers and loses track of which item came
-- from which, so every restock starts with hunting for the right chat. A
-- product points at its usual supplier and the admin UI links straight to
-- that supplier's WhatsApp.
--
-- Apply:
--   psql -h localhost -p 5433 -U postgres -d bazarsip -f migrations/003_suppliers.sql

BEGIN;

CREATE TABLE IF NOT EXISTS suppliers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    -- Digits only, with country code, e.g. 6281234567890. Nullable because a
    -- supplier may only be reachable in person.
    whatsapp VARCHAR(20),
    location TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SET NULL, not CASCADE: removing a supplier must never take products with it.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS supplier_id INTEGER
  REFERENCES suppliers(id) ON DELETE SET NULL;

-- Stock is mixed: some items are on hand, others are ordered from the
-- supplier once a customer commits.
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS availability VARCHAR(20) NOT NULL DEFAULT 'ready'
  CHECK (availability IN ('ready', 'preorder'));

CREATE INDEX IF NOT EXISTS idx_products_supplier ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_availability ON products(availability);

DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

COMMIT;
