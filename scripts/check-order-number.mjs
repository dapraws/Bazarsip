// Self-check for lib/order-number.ts. Run: node scripts/check-order-number.mjs
import assert from "node:assert/strict";
import { generateOrderNumber } from "../lib/order-number.ts";

const AMBIGUOUS = /[01OILU]/;
const seen = new Set();

for (let i = 0; i < 20_000; i++) {
  const code = generateOrderNumber();
  assert.match(code, /^BZR-[2-9A-Z]{8}$/, `unexpected shape: ${code}`);
  assert.doesNotMatch(
    code.slice(4),
    AMBIGUOUS,
    `contains an easily misread character: ${code}`,
  );
  seen.add(code);
}

// 30^8 of space; 20k draws should essentially never repeat. A handful would
// still be caught by the unique index, but a burst means the generator broke.
assert.ok(seen.size > 19_995, `too many collisions: ${20_000 - seen.size}`);

console.log(`ok - 20000 codes, ${20_000 - seen.size} collisions`);
