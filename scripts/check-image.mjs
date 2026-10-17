// Self-check for lib/image.ts. Run: node scripts/check-image.mjs
import assert from "node:assert/strict";
import { sizedImage } from "../lib/image.ts";

const CLD = "https://res.cloudinary.com/demo/image/upload/v1/bazarsip/x.jpg";

assert.equal(
  sizedImage(CLD, 640),
  "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_640/v1/bazarsip/x.jpg",
);

// Already transformed: do not stack a second set on top.
const already =
  "https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_200/v1/x.jpg";
assert.equal(sizedImage(already, 800), already, "transformasi ganda");

// Anything not on Cloudinary is left alone.
const unsplash = "https://images.unsplash.com/photo-123?w=800";
assert.equal(sizedImage(unsplash, 400), unsplash);

assert.equal(sizedImage(null, 400), "");
assert.equal(sizedImage(undefined, 400), "");
assert.equal(sizedImage("", 400), "");

console.log("ok - 6 kasus URL gambar");
