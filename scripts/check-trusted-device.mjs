// End-to-end check of "ingat perangkat ini".
//
// Needs the app running on port 3100 and the seeded admin account, and leaves
// two-factor disabled again so it can be run repeatedly.
//
//   npx next build && npx next start -p 3100 &
//   node scripts/check-trusted-device.mjs
import assert from "node:assert/strict";
import pg from "pg";
import { generateCode, currentStep } from "../lib/totp.ts";

const BASE = "http://127.0.0.1:3100";
let jar = {};

function cookieHeader() {
  return Object.entries(jar).map(([k, v]) => `${k}=${v}`).join("; ");
}

async function call(path, body) {
  const res = await fetch(BASE + path, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json", cookie: cookieHeader() },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  for (const c of res.headers.getSetCookie?.() ?? []) {
    const [pair] = c.split(";");
    const idx = pair.indexOf("=");
    jar[pair.slice(0, idx)] = pair.slice(idx + 1);
  }
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
}

const creds = { email: "admin@bazarsip.com", password: "admin123" };

const start = await call("/api/auth/login", creds);
assert.ok(
  !start.json.requires2fa,
  "precondition: two-factor must be off before this runs. " +
    "Reset it with: node scripts/unlock-2fa.mjs admin@bazarsip.com --confirm",
);

const setup = await call("/api/auth/2fa/setup", {});
const secret = setup.json.data.secret;
await call("/api/auth/2fa/enable", { code: generateCode(secret, currentStep()) });
console.log("1. 2FA aktif                                  OK");

// Sign in and ask to be remembered.
jar = {};
let r = await call("/api/auth/login", creds);
assert.equal(r.json.requires2fa, true, "first sign-in must ask for a code");
r = await call("/api/auth/2fa/verify", {
  challenge: r.json.challenge,
  code: generateCode(secret, currentStep() + 1),
  remember: true,
});
assert.equal(r.json.success, true, JSON.stringify(r.json));
assert.ok(jar.trusted_device, "a device cookie must be issued");
console.log("2. minta diingat -> cookie perangkat terbit   OK");

// Same browser: no code this time.
const deviceCookie = jar.trusted_device;
jar = { trusted_device: deviceCookie };
r = await call("/api/auth/login", creds);
assert.ok(!r.json.requires2fa, "a remembered browser must skip the code");
assert.equal(r.json.success, true);
console.log("3. masuk lagi tanpa kode                      OK");

// A browser without the cookie still has to prove itself.
jar = {};
r = await call("/api/auth/login", creds);
assert.equal(r.json.requires2fa, true, "a new browser must still be challenged");
console.log("4. perangkat lain tetap diminta kode          OK");

// The cookie must not let a different account through.
jar = { trusted_device: deviceCookie };
r = await call("/api/auth/login", {
  email: "customer@bazarsip.com",
  password: "customer123",
});
assert.equal(r.json.success, true);
assert.notEqual(r.json.user.email, "admin@bazarsip.com", "wrong account returned");
console.log("5. cookie tidak berlaku untuk akun lain       OK");

// Forgetting devices puts the code back.
jar = { trusted_device: deviceCookie };
await call("/api/auth/login", creds);
r = await call("/api/auth/2fa/devices");
assert.equal(r.json.data.length, 1, "one remembered device expected");

const del = await fetch(BASE + "/api/auth/2fa/devices", {
  method: "DELETE",
  headers: { cookie: cookieHeader() },
});
assert.equal((await del.json()).success, true);

jar = { trusted_device: deviceCookie };
r = await call("/api/auth/login", creds);
assert.equal(r.json.requires2fa, true, "a forgotten device must be challenged again");
console.log("6. lupakan perangkat -> diminta kode lagi     OK");

// Leave the account as it was found. Done against the database rather than
// the API: every code for the current window has already been spent by the
// checks above, and waiting out the clock would only slow the run down.
const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgres://postgres:postgres@localhost:5433/bazarsip",
});
await pool.query(
  `UPDATE users SET totp_enabled = false, totp_secret = NULL,
                    totp_last_step = NULL, recovery_codes = NULL
   WHERE email = $1`,
  [creds.email],
);
await pool.query(
  "DELETE FROM trusted_devices WHERE user_id = (SELECT id FROM users WHERE email = $1)",
  [creds.email],
);
await pool.end();

console.log("\nok - perangkat tepercaya lolos semua, akun dikembalikan");
