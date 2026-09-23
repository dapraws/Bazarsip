// Self-check for lib/totp.ts against the published test vectors.
// Run: node scripts/check-totp.mjs
import assert from "node:assert/strict";
import {
  toBase32,
  fromBase32,
  generateCode,
  verifyCode,
  currentStep,
  otpauthUri,
} from "../lib/totp.ts";

// --- base32, RFC 4648 section 10 ---
const BASE32 = [
  ["", ""],
  ["f", "MY"],
  ["fo", "MZXQ"],
  ["foo", "MZXW6"],
  ["foob", "MZXW6YQ"],
  ["fooba", "MZXW6YTB"],
  ["foobar", "MZXW6YTBOI"],
];

for (const [plain, encoded] of BASE32) {
  assert.equal(toBase32(Buffer.from(plain)), encoded, `base32("${plain}")`);
  assert.equal(
    fromBase32(encoded).toString(),
    plain,
    `base32 round trip "${plain}"`,
  );
}

// --- TOTP, RFC 6238 appendix B (SHA-1 rows) ---
// The published values are 8 digits; a 6-digit code is the last six of them,
// since (x % 10^8) % 10^6 === x % 10^6.
const SECRET = toBase32(Buffer.from("12345678901234567890"));

const VECTORS = [
  [59, "94287082"],
  [1111111109, "07081804"],
  [1111111111, "14050471"],
  [1234567890, "89005924"],
  [2000000000, "69279037"],
  [20000000000, "65353130"],
];

for (const [unixTime, eightDigits] of VECTORS) {
  const step = Math.floor(unixTime / 30);
  assert.equal(
    generateCode(SECRET, step),
    eightDigits.slice(-6),
    `RFC 6238 vector at T=${unixTime}`,
  );
}

// --- verification behaviour ---
const now = 1_700_000_000_000;
const step = currentStep(now);

assert.equal(verifyCode(SECRET, generateCode(SECRET, step), now).valid, true);

// One step either side is accepted: clocks drift, and a code read aloud may
// arrive just after it rolls over.
assert.equal(
  verifyCode(SECRET, generateCode(SECRET, step - 1), now).valid,
  true,
  "previous step must be accepted",
);
assert.equal(
  verifyCode(SECRET, generateCode(SECRET, step + 1), now).valid,
  true,
  "next step must be accepted",
);

// Two steps away is not.
assert.equal(
  verifyCode(SECRET, generateCode(SECRET, step - 2), now).valid,
  false,
  "the window must not be wider than one step",
);

// The matched step is returned so the caller can refuse a replay.
assert.equal(
  verifyCode(SECRET, generateCode(SECRET, step), now).step,
  step,
  "must report which step matched",
);

assert.equal(verifyCode(SECRET, "000000", now).valid, false);
assert.equal(verifyCode(SECRET, "12345", now).valid, false, "too short");
assert.equal(verifyCode(SECRET, "", now).valid, false);
assert.equal(verifyCode(SECRET, "abcdef", now).valid, false);

// --- provisioning URI ---
const uri = otpauthUri(SECRET, "bunda@bazarsip.com", "Bazarsip");
assert.match(uri, /^otpauth:\/\/totp\//);
assert.ok(uri.includes(`secret=${SECRET}`), "URI must carry the secret");
assert.ok(uri.includes("digits=6") && uri.includes("period=30"));

console.log(
  `ok - ${BASE32.length} base32 cases, ${VECTORS.length} RFC 6238 vectors, window and replay checks`,
);
