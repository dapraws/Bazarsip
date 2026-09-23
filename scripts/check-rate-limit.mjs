// Self-check for lib/rate-limit.ts. Run: node scripts/check-rate-limit.mjs
import assert from "node:assert/strict";
import { createRateLimiter } from "../lib/rate-limit.ts";

const WINDOW = 60_000;
const limiter = createRateLimiter(3, WINDOW);
let t = 1_000_000;

// Three attempts are fine, the fourth is not.
for (let i = 1; i <= 3; i++) {
  assert.equal(limiter.hit("a", t).allowed, true, `attempt ${i}`);
}
const blocked = limiter.hit("a", t);
assert.equal(blocked.allowed, false, "fourth attempt must be blocked");
assert.ok(blocked.retryAfter > 0, "must say how long to wait");

// A different key is unaffected.
assert.equal(limiter.hit("b", t).allowed, true, "other keys are independent");

// The window expires.
assert.equal(
  limiter.hit("a", t + WINDOW + 1).allowed,
  true,
  "window must expire",
);

// A success clears the count.
const r = createRateLimiter(2, WINDOW);
r.hit("c", t);
r.hit("c", t);
assert.equal(r.hit("c", t).allowed, false, "third is blocked");
r.reset("c");
assert.equal(r.hit("c", t).allowed, true, "reset clears the count");

console.log("ok - rate limiter windows, isolation and reset");

// A blocked key stays blocked no matter what the caller does next — the
// check must not depend on the attempt failing.
const g = createRateLimiter(2, WINDOW);
g.hit("d", t);
g.hit("d", t);
g.hit("d", t); // pushes it over
assert.equal(g.isBlocked("d", t).blocked, true, "must report blocked");
assert.equal(
  g.isBlocked("d", t + WINDOW + 1).blocked,
  false,
  "block must lift with the window",
);
assert.equal(g.isBlocked("never-seen", t).blocked, false, "unknown keys pass");

console.log("ok - isBlocked gates independently of the attempt outcome");
