import { NextResponse } from "next/server";

/**
 * Clears the session.
 *
 * The cookie is httpOnly, so scripts cannot remove it — `document.cookie =
 * "session="` silently does nothing and leaves the visitor signed in. Only
 * the server can expire it.
 */
export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set("session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });

  return response;
}
