// End-to-end check of the two-factor flow.
//
// Needs the app running on port 3100 and the seeded admin account. It leaves
// two-factor disabled again so it can be run repeatedly.
//
//   npx next build && npx next start -p 3100 &
//   node scripts/check-2fa-flow.mjs
import assert from "node:assert/strict";
import { generateCode, currentStep } from "../lib/totp.ts";

const BASE = "http://127.0.0.1:3100";
let cookie = "";

async function call(path, body, opts = {}) {
  const res = await fetch(BASE + path, {
    method: body ? "POST" : "GET",
    headers: { "Content-Type": "application/json", ...(cookie ? { cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  const setCookie = res.headers.get("set-cookie");
  if (setCookie && opts.keepCookie !== false) cookie = setCookie.split(";")[0];
  let json = null;
  try { json = await res.json(); } catch {}
  return { status: res.status, json };
}

// 1. password login, no second factor yet
let r = await call("/api/auth/login", { email: "admin@bazarsip.com", password: "admin123" });
assert.equal(r.status, 200);
assert.ok(!r.json.requires2fa, "2FA should be off to begin with");
console.log("1. login biasa                       OK");

// 2. enrol
r = await call("/api/auth/2fa/setup", {});
assert.equal(r.json.success, true);
const secret = r.json.data.secret;
assert.ok(r.json.data.qr.startsWith("data:image/png;base64,"), "QR must be a data URL");
console.log("2. setup: rahasia + QR               OK");

// 3. confirm with a live code
r = await call("/api/auth/2fa/enable", { code: generateCode(secret, currentStep()) });
assert.equal(r.json.success, true, JSON.stringify(r.json));
const recoveryCodes = r.json.data.recoveryCodes;
assert.equal(recoveryCodes.length, 8);
console.log("3. aktifkan + 8 kode cadangan        OK");

// 4. wrong code must not enable anything
r = await call("/api/auth/2fa/enable", { code: "000000" });
assert.equal(r.status, 400, "a wrong code must be refused");
console.log("4. kode salah ditolak                OK");

// 5. sign out, then password alone is no longer enough
cookie = "";
r = await call("/api/auth/login", { email: "admin@bazarsip.com", password: "admin123" });
assert.equal(r.json.requires2fa, true, "password alone must not be a session");
assert.ok(r.json.challenge, "a challenge must be issued");
assert.ok(!r.json.token, "no raw token may be returned");
const challenge = r.json.challenge;
console.log("5. sandi saja tidak cukup            OK");

// 6. the challenge is not a session
const probe = await fetch(BASE + "/api/users", { headers: { cookie: `session=${challenge}` } });
assert.equal(probe.status, 403, `challenge must not act as a session (got ${probe.status})`);
console.log("6. challenge bukan sesi              OK");

// 7. correct code completes the login
// Enabling consumed the current step, so use the next one: still inside the
// drift window, and not yet spent.
const step = currentStep() + 1;
const code = generateCode(secret, step);
r = await call("/api/auth/2fa/verify", { challenge, code });
assert.equal(r.json.success, true, JSON.stringify(r.json));
console.log("7. kode benar -> masuk               OK");

// 8. the same code must not work twice
const fresh = await call("/api/auth/login", { email: "admin@bazarsip.com", password: "admin123" });
r = await call("/api/auth/2fa/verify", { challenge: fresh.json.challenge, code });
assert.equal(r.status, 401, "a used code must be refused");
assert.match(r.json.error, /sudah dipakai/i);
console.log("8. kode dipakai ulang ditolak        OK");

// 9. a recovery code works, once
const fresh2 = await call("/api/auth/login", { email: "admin@bazarsip.com", password: "admin123" });
r = await call("/api/auth/2fa/verify", { challenge: fresh2.json.challenge, code: recoveryCodes[0] });
assert.equal(r.json.success, true, "recovery code must work");
const fresh3 = await call("/api/auth/login", { email: "admin@bazarsip.com", password: "admin123" });
r = await call("/api/auth/2fa/verify", { challenge: fresh3.json.challenge, code: recoveryCodes[0] });
assert.equal(r.status, 401, "a recovery code must be single use");
console.log("9. kode cadangan sekali pakai        OK");

// Leave the account as it was found.
const last = await call("/api/auth/login", { email: "admin@bazarsip.com", password: "admin123" });
await call("/api/auth/2fa/verify", {
  challenge: last.json.challenge,
  code: recoveryCodes[1],
});
r = await call("/api/auth/2fa/disable", { password: "admin123" });
assert.equal(r.json.success, true, "cleanup: could not disable 2FA");

console.log("\nok - semua langkah 2FA lolos, akun dikembalikan seperti semula");
