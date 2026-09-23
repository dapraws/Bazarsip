-- Replace the starter catalogue with real categories.
--
-- DESTRUCTIVE: removes every product, category, cart and order. The seed data
-- was scaffolding ("Gaming Laptop Pro", "Electronics", "Books") and describes
-- a different shop entirely. Run this once, before entering real stock.
--
-- Categories are by item type only. The catalogue also varies by audience
-- (anak / remaja / dewasa) and by branded vs unbranded, but products carry
-- exactly one category, so those axes need a separate field — worth adding
-- once there is enough real stock to see how it is actually browsed.
--
-- Apply:
--   psql -h localhost -p 5433 -U postgres -d bazarsip -f migrations/004_replace_demo_catalogue.sql

BEGIN;

DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM cart_items;
DELETE FROM carts;
DELETE FROM products;
DELETE FROM categories;

ALTER SEQUENCE categories_id_seq RESTART WITH 1;
ALTER SEQUENCE products_id_seq RESTART WITH 1;
ALTER SEQUENCE orders_id_seq RESTART WITH 1;

INSERT INTO categories (name, slug, description) VALUES
('Sepatu',    'sepatu',    'Sepatu anak, remaja, dan dewasa'),
('Tas',       'tas',       'Tas sekolah, selempang, ransel, dan tas tangan'),
('Baju',      'baju',      'Atasan, kaos, kemeja, dan dress'),
('Celana',    'celana',    'Celana panjang, pendek, jeans, dan rok'),
('Olahraga',  'olahraga',  'Perlengkapan dan pakaian olahraga'),
('Formal',    'formal',    'Pakaian kerja dan acara resmi'),
('Aksesoris', 'aksesoris', 'Topi, ikat pinggang, kaus kaki, dan lainnya');

COMMIT;
