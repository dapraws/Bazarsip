-- Public identifier for orders.
--
-- Order URLs and references used the sequential primary key, which tells
-- anyone who sees one how many orders the shop has taken. It is also not a
-- number anyone wants to read out over WhatsApp. This adds a random, short,
-- unambiguous code that customers and the seller can quote to each other.
--
-- Apply:
--   psql -h localhost -p 5433 -U postgres -d bazarsip -f migrations/001_order_number.sql

BEGIN;

ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number VARCHAR(20);

-- Backfill existing rows. The alphabet omits 0/O/1/I/L/U so a code is never
-- misread; this generator is only used here, the application generates its
-- own on insert.
UPDATE orders
SET order_number = 'BZR-' || (
  SELECT string_agg(
    substr('23456789ABCDEFGHJKMNPQRSTVWXYZ',
           (random() * 29)::int + 1, 1),
    ''
  )
  FROM generate_series(1, 8)
)
WHERE order_number IS NULL;

ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_number
  ON orders(order_number);

COMMIT;
