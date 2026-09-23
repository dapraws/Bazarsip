import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// Admin only, and read-only by design: there is no endpoint that edits or
// deletes an entry. A log the people it watches can rewrite is not a log.
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req, "admin");
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = 50;
    const action = searchParams.get("action");

    const conditions: string[] = [];
    const values: unknown[] = [];

    if (action && action !== "all") {
      values.push(action);
      conditions.push(`action = $${values.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM audit_log ${where}`,
      values,
    );
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      `SELECT * FROM audit_log ${where}
       ORDER BY created_at DESC
       LIMIT $${values.length + 1} OFFSET $${values.length + 2}`,
      [...values, limit, (page - 1) * limit],
    );

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching audit log:", error);
    return NextResponse.json(
      { success: false, error: "Gagal memuat riwayat" },
      { status: 500 },
    );
  }
}
