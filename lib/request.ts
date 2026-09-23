import type { NextRequest } from "next/server";

/**
 * Best-effort client address for rate limiting.
 *
 * Behind the reverse proxy this comes from X-Forwarded-For. The header is
 * caller-controlled, so it is only ever used for throttling — never for
 * authorisation.
 */
export function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
