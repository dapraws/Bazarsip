import { NextRequest, NextResponse } from "next/server";
import {
  authorizeUrl,
  isGoogleConfigured,
  newState,
  publicOrigin,
  STATE_COOKIE,
} from "@/lib/google-oauth";

export async function GET(req: NextRequest) {
  if (!isGoogleConfigured()) {
    return NextResponse.redirect(
      new URL("/login?error=google_tidak_tersedia", req.url),
    );
  }

  const state = newState();
  const origin = publicOrigin(req);

  const response = NextResponse.redirect(authorizeUrl(origin, state));

  // The state is held in an httpOnly cookie and compared on the way back.
  // Without it, an attacker can hand someone a prepared callback URL and
  // sign them into an account that is not theirs.
  response.cookies.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });

  return response;
}
