// lib/db.ts
import { Pool } from "pg";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Test connection
pool.on("error", (err) => {
  console.error("Unexpected database error:", err);
});
