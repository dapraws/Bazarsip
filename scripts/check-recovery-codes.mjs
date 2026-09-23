// Self-check for lib/recovery-codes.ts. Run: node scripts/check-recovery-codes.mjs
import assert from "node:assert/strict";
import {
  generateRecoveryCodes,
  hashRecoveryCodes,
  consumeRecoveryCode,
} from "../lib/recovery-codes.ts";

const codes = generateRecoveryCodes();
assert.equal(codes.length, 8);
assert.equal(new Set(codes).size, 8, "codes must be distinct");

for (const code of codes) {
  assert.match(code, /^[2-9A-Z]{5}-[2-9A-Z]{5}$/, `shape of ${code}`);
  assert.doesNotMatch(code, /[01OILU]/, `easily misread character in ${code}`);
}

const hashes = await hashRecoveryCodes(codes);
assert.ok(
  hashes.every((h) => h.startsWith("$2")),
  "codes must be stored hashed",
);
assert.ok(
  !hashes.some((h) => codes.includes(h)),
  "no plaintext may survive in storage",
);

// A valid code matches and is removed from the set.
const first = await consumeRecoveryCode(codes[0], hashes);
assert.equal(first.matched, true);
assert.equal(first.remaining.length, 7, "a used code must be consumed");

// The same code cannot be used twice.
const again = await consumeRecoveryCode(codes[0], first.remaining);
assert.equal(again.matched, false, "a consumed code must not work again");
assert.equal(again.remaining.length, 7);

// Case and padding are forgiven; these get typed off paper.
const second = await consumeRecoveryCode(
  `  ${codes[1].toLowerCase()} `,
  first.remaining,
);
assert.equal(second.matched, true, "input is trimmed and case-insensitive");

assert.equal((await consumeRecoveryCode("NOPE1-NOPE2", hashes)).matched, false);
assert.equal((await consumeRecoveryCode(codes[0], null)).matched, false);
assert.equal((await consumeRecoveryCode(codes[0], [])).matched, false);

console.log("ok - recovery codes: shape, hashing, single use, null safety");
