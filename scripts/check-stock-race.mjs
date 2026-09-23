// Proves the stock guard in app/api/orders/route.ts holds under concurrency.
// Two transactions race for the last unit; exactly one may win.
//
// Run against the dev database:  node scripts/check-stock-race.mjs
import assert from "node:assert/strict";
import pg from "pg";

const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgres://postgres:postgres@localhost:5433/bazarsip",
});

// Same statement the order route issues.
const DECREMENT =
  "UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1";

async function attempt(productId, quantity) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const res = await client.query(DECREMENT, [quantity, productId]);
    if (res.rowCount === 0) {
      await client.query("ROLLBACK");
      return "rejected";
    }
    await client.query("COMMIT");
    return "accepted";
  } finally {
    client.release();
  }
}

const { rows } = await pool.query(
  `INSERT INTO products (name, slug, price, stock, category_id)
   SELECT 'race-check', 'race-check-' || gen_random_uuid(), 1000, 1, id
   FROM categories LIMIT 1
   RETURNING id`,
);
const productId = rows[0].id;

try {
  const results = await Promise.all([
    attempt(productId, 1),
    attempt(productId, 1),
  ]);

  const accepted = results.filter((r) => r === "accepted").length;
  const { rows: after } = await pool.query(
    "SELECT stock FROM products WHERE id = $1",
    [productId],
  );

  assert.equal(accepted, 1, `expected 1 winner, got ${accepted}`);
  assert.equal(Number(after[0].stock), 0, "stock must land on exactly 0");
  console.log("ok - one order won, stock did not go negative");
} finally {
  await pool.query("DELETE FROM products WHERE id = $1", [productId]);
  await pool.end();
}
