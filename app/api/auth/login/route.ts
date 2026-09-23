import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { pool } from "@/lib/db";
import { createRateLimiter } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";

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

function rejectOrThrottle(key: string, ip: string) {
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
      "SELECT id, email, name, role, password FROM users WHERE email = $1",
      [email],
    );

    if (userRes.rows.length === 0) {
      return rejectOrThrottle(limiterKey, ip);
    }

    const user = userRes.rows[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return rejectOrThrottle(limiterKey, ip);
    }

    loginLimiter.reset(limiterKey);

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" },
    );

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      token,
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
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return response;
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
