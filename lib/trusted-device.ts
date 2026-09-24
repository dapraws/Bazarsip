import { randomBytes, createHash } from "crypto";
import type { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { pool } from "@/lib/db";

export const TRUSTED_DEVICE_COOKIE = "trusted_device";
const TRUST_DAYS = 30;

/**
 * Hashed with SHA-256 rather than bcrypt.
 *
 * The token is 32 random bytes, so there is nothing to brute force and no
 * need for a slow hash. What matters is that the database never holds a
 * value that could be replayed as a cookie, and every sign-in has to look
 * one up, which bcrypt would make needlessly slow.
 */
function hash(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Short description of the browser, so the list means something later. */
function describe(userAgent: string | null): string {
  if (!userAgent) return "Perangkat tidak dikenal";
  if (/iPhone|iPad/i.test(userAgent)) return "iPhone atau iPad";
  if (/Android/i.test(userAgent)) return "Android";
  if (/Macintosh/i.test(userAgent)) return "Mac";
  if (/Windows/i.test(userAgent)) return "Windows";
  return "Perangkat lain";
}

/**
 * Remembers this browser and attaches the cookie to the response.
 *
 * Only ever called after a code has already been verified: trusting a device
 * is something the second factor grants, never something that replaces it.
 */
export async function trustDevice(
  userId: number,
  req: NextRequest,
  response: NextResponse,
): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + TRUST_DAYS * 24 * 60 * 60 * 1000);

  await pool.query(
    `INSERT INTO trusted_devices (user_id, token_hash, label, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [userId, hash(token), describe(req.headers.get("user-agent")), expiresAt],
  );

  response.cookies.set(TRUSTED_DEVICE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: TRUST_DAYS * 24 * 60 * 60,
    path: "/",
  });
}

/**
 * Whether this browser may skip the code for this specific user.
 *
 * Bound to the user id on purpose: a cookie issued for one account must
 * never wave another one through.
 */
export async function isDeviceTrusted(
  userId: number,
  req: NextRequest,
): Promise<boolean> {
  const token = req.cookies.get(TRUSTED_DEVICE_COOKIE)?.value;
  if (!token) return false;

  const { rows } = await pool.query(
    `UPDATE trusted_devices
     SET last_used_at = CURRENT_TIMESTAMP
     WHERE user_id = $1 AND token_hash = $2 AND expires_at > CURRENT_TIMESTAMP
     RETURNING id`,
    [userId, hash(token)],
  );

  return rows.length > 0;
}

/** Forgets every remembered browser for this user. */
export async function revokeAllDevices(userId: number): Promise<number> {
  const { rowCount } = await pool.query(
    "DELETE FROM trusted_devices WHERE user_id = $1",
    [userId],
  );
  return rowCount ?? 0;
}

export async function countTrustedDevices(userId: number): Promise<number> {
  const { rows } = await pool.query(
    `SELECT COUNT(*)::int AS count FROM trusted_devices
     WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP`,
    [userId],
  );
  return rows[0].count;
}
