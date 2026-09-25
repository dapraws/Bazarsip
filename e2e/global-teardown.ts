import pg from "pg";

/**
 * Removes rows the tests created.
 *
 * Done against the database rather than the API: a request context in a
 * teardown carries no browser session, so the delete comes back 401 and the
 * rows quietly pile up in the development database.
 */
export default async function globalTeardown() {
  const pool = new pg.Pool({
    connectionString:
      process.env.DATABASE_URL ??
      "postgres://postgres:postgres@localhost:5433/bazarsip",
  });

  try {
    const { rowCount } = await pool.query(
      "DELETE FROM products WHERE name LIKE 'Uji Playwright %'",
    );
    if (rowCount) console.log(`\n  teardown: ${rowCount} produk uji dihapus`);
  } finally {
    await pool.end();
  }
}
