import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { pool } from "@/lib/db";

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get("session")?.value;

    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decoded = jwt.verify(
      sessionToken,
      process.env.JWT_SECRET!,
    ) as JWTPayload;

    // The token carries id, email and role only. The name lives in the
    // database, and the profile page needs it.
    const result = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [decoded.userId],
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    return NextResponse.json({ success: true, user: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ error: "Invalid session" }, { status: 401 });
  }
}
