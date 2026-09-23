// Self-check for lib/format.ts. Run: node scripts/check-format.mjs
import assert from "node:assert/strict";
import { formatRupiah } from "../lib/format.ts";

const cases = [
  ["2500000.00", "Rp 2.500.000"], // the shape node-postgres actually returns
  [2500000, "Rp 2.500.000"],
  ["150000.00", "Rp 150.000"],
  [0, "Rp 0"],
  ["0.00", "Rp 0"],
  [null, "Rp 0"],
  [undefined, "Rp 0"],
  ["", "Rp 0"],
  ["abc", "Rp 0"],
  [999.6, "Rp 1.000"],
];

for (const [input, expected] of cases) {
  assert.equal(
    formatRupiah(input),
    expected,
    `formatRupiah(${JSON.stringify(input)})`,
  );
}

console.log(`ok - ${cases.length} currency cases`);
