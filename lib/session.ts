import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

const SESSION_DAYS = 7;

/**
 * Issues the signed session cookie.
 *
 * Shared by password login and by two-factor verification so there is
 * exactly one place a session can be minted: two copies drift, and the copy
 * that forgets a flag is the one an attacker finds.
 */
export function issueSession(user: SessionUser) {
  const token = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET!,
    { expiresIn: `${SESSION_DAYS}d` },
  );

  const response = NextResponse.json({
    success: true,
    message: "Login successful",
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

  response.cookies.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * SESSION_DAYS,
    path: "/",
  });

  return response;
}

/**
 * A short-lived token proving the password step passed, and nothing else.
 *
 * It is deliberately not the session cookie: between the password and the
 * code the caller must be able to do exactly one thing: submit a code. It
 * carries its own purpose so a challenge can never be presented as a
 * session, and it expires in minutes rather than days.
 */
export function issueChallenge(userId: number): string {
  return jwt.sign({ userId, purpose: "2fa" }, process.env.JWT_SECRET!, {
    expiresIn: "5m",
  });
}

export function readChallenge(token: string): number | null {
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: number;
      purpose?: string;
    };
    return payload.purpose === "2fa" ? payload.userId : null;
  } catch {
    return null;
  }
}
