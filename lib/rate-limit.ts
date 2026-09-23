/**
 * Fixed-window counter for throttling repeated failures.
 *
 * ponytail: in-memory, so the window is per process. That is correct for a
 * single container; move the counter to Redis if the app is ever run on more
 * than one instance.
 */
export interface RateLimiter {
  /** Records one hit. Returns whether the caller is still allowed through. */
  hit(key: string, now?: number): { allowed: boolean; retryAfter: number };
  /** Reads the current state without recording a hit. */
  isBlocked(key: string, now?: number): { blocked: boolean; retryAfter: number };
  /** Clears a key — call on success so a good login resets the count. */
  reset(key: string): void;
}

export function createRateLimiter(
  limit: number,
  windowMs: number,
): RateLimiter {
  const hits = new Map<string, { count: number; expiresAt: number }>();

  return {
    hit(key, now = Date.now()) {
      // Cheap sweep: without it the map grows with every distinct key seen.
      if (hits.size > 10_000) {
        for (const [k, v] of hits) {
          if (v.expiresAt <= now) hits.delete(k);
        }
      }

      const entry = hits.get(key);

      if (!entry || entry.expiresAt <= now) {
        hits.set(key, { count: 1, expiresAt: now + windowMs });
        return { allowed: true, retryAfter: 0 };
      }

      entry.count++;

      return entry.count > limit
        ? {
            allowed: false,
            retryAfter: Math.ceil((entry.expiresAt - now) / 1000),
          }
        : { allowed: true, retryAfter: 0 };
    },

    isBlocked(key, now = Date.now()) {
      const entry = hits.get(key);

      if (!entry || entry.expiresAt <= now || entry.count <= limit) {
        return { blocked: false, retryAfter: 0 };
      }

      return {
        blocked: true,
        retryAfter: Math.ceil((entry.expiresAt - now) / 1000),
      };
    },

    reset(key) {
      hits.delete(key);
    },
  };
}
