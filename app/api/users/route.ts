import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
// GET - Admin only
export async function GET(req: NextRequest) {
  // Require admin authentication
  const authResult = await requireAuth(req, "admin");
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const result = await pool.query(`
      SELECT id, name, email, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch users",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
