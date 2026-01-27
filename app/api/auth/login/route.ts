import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const userRes = await pool.query(
    "SELECT id, password FROM users WHERE email = $1",
    [email]
  );

  if (userRes.rows.length === 0) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const user = userRes.rows[0];
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET!,
    { expiresIn: "7d" }
  );

  return NextResponse.json({ token });
}
