-- Widen money columns for rupiah amounts.
--
-- DECIMAL(10,2) caps at 99,999,999.99. Individual prices fit, but an order
-- total crosses that line well within normal wholesale volumes, and the
-- overflow surfaces as an opaque "Failed to create order" rather than
-- anything the seller could act on.
--
-- Apply:
--   psql -h localhost -p 5433 -U postgres -d bazarsip -f migrations/002_widen_money_columns.sql

BEGIN;

ALTER TABLE products    ALTER COLUMN price         TYPE DECIMAL(14, 2);
ALTER TABLE orders      ALTER COLUMN total         TYPE DECIMAL(14, 2);
ALTER TABLE orders      ALTER COLUMN shipping_cost TYPE DECIMAL(14, 2);
-- subtotal is a stored generated column over price, so it blocks the type
-- change. It is fully derived, so dropping and recreating it loses nothing.
ALTER TABLE order_items DROP COLUMN subtotal;
ALTER TABLE order_items ALTER COLUMN price         TYPE DECIMAL(14, 2);
ALTER TABLE order_items
  ADD COLUMN subtotal DECIMAL(14, 2)
  GENERATED ALWAYS AS (price * quantity) STORED;

COMMIT;
