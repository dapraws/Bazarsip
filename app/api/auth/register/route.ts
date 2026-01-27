import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  const { name, email, password } = await req.json();

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const userRes = await pool.query(
      `
      INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING id, email
      `,
      [name, email, hashedPassword]
    );

    return NextResponse.json(userRes.rows[0]);
  } catch (err) {
    return NextResponse.json(
      { error: "Email already exists" },
      { status: 400 }
    );
  }
}
