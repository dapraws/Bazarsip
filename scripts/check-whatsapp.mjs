// Self-check for lib/whatsapp.ts. Run: node scripts/check-whatsapp.mjs
import assert from "node:assert/strict";
import { normalizeWhatsapp, whatsappLink } from "../lib/whatsapp.ts";

const cases = [
  ["081234567890", "6281234567890"],
  ["+62 812-3456-7890", "6281234567890"],
  ["62 812 3456 7890", "6281234567890"],
  ["81234567890", "6281234567890"], // dictated without the leading zero
  ["0812 3456 7890 ", "6281234567890"],
  ["(0812) 3456-7890", "6281234567890"],
  ["0812", null], // too short to dial
  ["", null],
  ["-", null],
  [null, null],
];

for (const [input, expected] of cases) {
  assert.equal(
    normalizeWhatsapp(input),
    expected,
    `normalizeWhatsapp(${JSON.stringify(input)})`,
  );
}

assert.equal(whatsappLink("0812-3456-7890"), "https://wa.me/6281234567890");
assert.equal(whatsappLink("0812"), null);

console.log(`ok - ${cases.length} number cases, 2 link cases`);
