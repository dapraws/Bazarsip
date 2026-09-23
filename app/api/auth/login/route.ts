import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { pool } from "@/lib/db";
import { createRateLimiter } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";

// Only failures count, so someone signing in repeatedly is never locked out
// by their own success.
const loginLimiter = createRateLimiter(5, 15 * 60 * 1000);

function rejectOrThrottle(key: string) {
  const { allowed, retryAfter } = loginLimiter.hit(key);

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

    const limiterKey = `${clientIp(req)}:${String(email).toLowerCase()}`;
    const throttled = loginLimiter.isBlocked(limiterKey);

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
      return rejectOrThrottle(limiterKey);
    }

    const user = userRes.rows[0];
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return rejectOrThrottle(limiterKey);
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
