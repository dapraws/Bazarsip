import { randomBytes } from "crypto";

/**
 * Sign in with Google, authorization code flow.
 *
 * The code is exchanged server to server using the client secret, so the
 * claims that come back are trusted without separately verifying the
 * id_token signature: nobody else can make that request.
 */

const AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export const STATE_COOKIE = "google_oauth_state";

export function isGoogleConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );
}

/**
 * The public address of this app.
 *
 * A route handler's own request URL is the internal one: it stays
 * http://localhost:PORT no matter which host the visitor typed, so behind a
 * reverse proxy the callback would be registered as localhost and Google
 * would refuse it. APP_URL settles it; the forwarded headers are a fallback
 * for a proxy that sets them, and they are only ever used to build a URI
 * that Google already has to have on its allow list.
 */
export function publicOrigin(req: {
  url: string;
  headers: { get(name: string): string | null };
}): string {
  const configured = process.env.APP_URL?.replace(/\/+$/, "");
  if (configured) return configured;

  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (host) {
    const proto = req.headers.get("x-forwarded-proto") ?? "http";
    return `${proto}://${host}`;
  }

  return new URL(req.url).origin;
}

/** Where Google sends the browser back. Must match the console exactly. */
export function redirectUri(origin: string): string {
  return `${origin}/api/auth/google/callback`;
}

export function newState(): string {
  return randomBytes(32).toString("hex");
}

export function authorizeUrl(origin: string, state: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: redirectUri(origin),
    response_type: "code",
    scope: "openid email profile",
    state,
    // Ask every time rather than silently reusing whichever account the
    // browser happens to be signed into.
    prompt: "select_account",
  });
  return `${AUTH_URL}?${params.toString()}`;
}

export interface GoogleProfile {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
}

export async function exchangeCode(
  code: string,
  origin: string,
): Promise<GoogleProfile | null> {
  const tokenRes = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri(origin),
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    console.error("Google token exchange failed:", await tokenRes.text());
    return null;
  }

  const { access_token } = await tokenRes.json();
  if (!access_token) return null;

  const userRes = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!userRes.ok) {
    console.error("Google userinfo failed:", await userRes.text());
    return null;
  }

  const profile = await userRes.json();
  if (!profile.sub || !profile.email) return null;

  return {
    sub: String(profile.sub),
    email: String(profile.email).toLowerCase(),
    emailVerified: profile.email_verified === true,
    name: profile.name ? String(profile.name) : null,
  };
}
