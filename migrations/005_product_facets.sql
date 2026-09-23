-- Split the catalogue into independent axes.
--
-- Categories mixed two different things: item type (Sepatu, Tas, Baju) and
-- style (Olahraga, Formal). A product carries exactly one category, so a
-- sports shoe had to be filed as one or the other even though it is both.
--
-- Type stays in categories. Who it is for, what age, what style and which
-- brand become their own columns, so a product can be found through any of
-- them.
--
-- Every new column is nullable on purpose. The seller must be able to save a
-- product with just a name, a price and a category and fill the rest in
-- later; a form that demands everything gets abandoned.
--
-- Apply:
--   psql -h localhost -p 5433 -U postgres -d bazarsip -f migrations/005_product_facets.sql

BEGIN;

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS gender VARCHAR(20)
  CHECK (gender IN ('pria', 'wanita', 'unisex'));

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS age_group VARCHAR(20)
  CHECK (age_group IN ('dewasa', 'remaja', 'anak'));

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS style VARCHAR(20)
  CHECK (style IN ('casual', 'formal', 'olahraga'));

-- Free text: brands are open-ended and new ones turn up constantly.
ALTER TABLE products ADD COLUMN IF NOT EXISTS brand VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_age_group ON products(age_group);
CREATE INDEX IF NOT EXISTS idx_products_style ON products(style);
CREATE INDEX IF NOT EXISTS idx_products_brand ON products(brand);

-- Categories become item type only. Olahraga and Formal move to the style
-- column; Topi was missing. Safe to delete outright because no product
-- references them yet — if that changes, reassign before running this.
DELETE FROM categories WHERE slug IN ('olahraga', 'formal');

INSERT INTO categories (name, slug, description)
VALUES ('Topi', 'topi', 'Topi dan penutup kepala')
ON CONFLICT (slug) DO NOTHING;

COMMIT;
