// Self-check for lib/slug.ts. Run: node scripts/check-slug.mjs
import assert from "node:assert/strict";
import { slugify, nextFreeSlug } from "../lib/slug.ts";

const slugs = [
  ["Gamis Brokat (Navy)", "gamis-brokat-navy"],
  ["  Kaos   Polos  ", "kaos-polos"],
  ["Sepatu Anak 39", "sepatu-anak-39"],
  ["Tas/Selempang", "tas-selempang"],
  ["2024", "2024-item"], // must not look like a row id
  ["!!!", "item"], // nothing usable left
  ["Café Latte", "cafe-latte"],
];

for (const [input, expected] of slugs) {
  assert.equal(slugify(input), expected, `slugify(${JSON.stringify(input)})`);
}

assert.equal(nextFreeSlug("kaos-polos", []), "kaos-polos");
assert.equal(nextFreeSlug("kaos-polos", ["kaos-polos"]), "kaos-polos-2");
assert.equal(
  nextFreeSlug("kaos-polos", ["kaos-polos", "kaos-polos-2"]),
  "kaos-polos-3",
);

console.log(`ok - ${slugs.length} slug cases, 3 collision cases`);
