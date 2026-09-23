import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { pool } from "@/lib/db";
import { createRateLimiter } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { issueSession, issueChallenge } from "@/lib/session";
import { logAudit } from "@/lib/audit";

// Only failures count, so someone signing in repeatedly is never locked out
// by their own success.
const loginLimiter = createRateLimiter(5, 15 * 60 * 1000);

// Keying only on address+email leaves credential stuffing wide open: rotate
// the email and every address gets its own fresh allowance. This caps the
// total failures from one address regardless of which accounts are tried.
// The ceiling is generous enough for a household or a shop sharing a
// connection, and it is not cleared by a success — otherwise an attacker
// with one valid account could reset it at will.
const addressLimiter = createRateLimiter(20, 15 * 60 * 1000);

async function rejectOrThrottle(key: string, ip: string, email: string) {
  await logAudit({
    action: "login_failed",
    entity: "user",
    entityId: email,
    ip,
  });

  const perEmail = loginLimiter.hit(key);
  const perAddress = addressLimiter.hit(ip);
  const allowed = perEmail.allowed && perAddress.allowed;
  const retryAfter = Math.max(perEmail.retryAfter, perAddress.retryAfter);

  if (!allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "Too many attempts. Please try again later.",
      },
      { status: 429, headers: { "Retry-After": String(retryAfter) } },
    );
  }

  return NextResponse.json(
    { success: false, error: "Invalid credentials" },
    { status: 401 },
  );
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 },
      );
    }

    const ip = clientIp(req);
    const limiterKey = `${ip}:${String(email).toLowerCase()}`;
    const byEmail = loginLimiter.isBlocked(limiterKey);
    const byAddress = addressLimiter.isBlocked(ip);
    const throttled = {
      blocked: byEmail.blocked || byAddress.blocked,
      retryAfter: Math.max(byEmail.retryAfter, byAddress.retryAfter),
    };

    if (throttled.blocked) {
      return NextResponse.json(
        { success: false, error: "Too many attempts. Please try again later." },
        {
          status: 429,
          headers: { "Retry-After": String(throttled.retryAfter) },
        },
      );
    }

    const userRes = await pool.query(
      "SELECT id, email, name, role, password, totp_enabled FROM users WHERE email = $1",
      [email],
    );

    if (userRes.rows.length === 0) {
      return rejectOrThrottle(limiterKey, ip, String(email).toLowerCase());
    }

    const user = userRes.rows[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return rejectOrThrottle(limiterKey, ip, String(email).toLowerCase());
    }

    loginLimiter.reset(limiterKey);

    // The password was right, but it is not a session yet. With a second
    // factor on, the caller gets a short-lived challenge that permits one
    // thing: submitting a code.
    if (user.totp_enabled) {
      return NextResponse.json({
        success: true,
        requires2fa: true,
        challenge: issueChallenge(user.id),
      });
    }

    await logAudit({
      action: "login",
      actor: { userId: user.id, email: user.email },
      ip,
    });

    return issueSession(user);
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred during login",
      },
      { status: 500 },
    );
  }
}
