import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { clientIp } from "@/lib/request";
import { normalizeWhatsapp } from "@/lib/whatsapp";

// GET - Admin only. Suppliers are internal; customers never see them.
export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req, "admin");
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const result = await pool.query(`
      SELECT s.*, COUNT(p.id)::int AS product_count
      FROM suppliers s
      LEFT JOIN products p ON p.supplier_id = s.id
      GROUP BY s.id
      ORDER BY s.name ASC
    `);

    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch suppliers" },
      { status: 500 },
    );
  }
}

// POST - Admin only
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req, "admin");
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { name, whatsapp, location, notes } = await req.json();

    if (!name || String(name).trim() === "") {
      return NextResponse.json(
        { success: false, error: "Supplier name is required" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `INSERT INTO suppliers (name, whatsapp, location, notes)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [
        String(name).trim(),
        normalizeWhatsapp(whatsapp),
        location || null,
        notes || null,
      ],
    );

    await logAudit({
      action: "supplier_create",
      actor: authResult.user,
      entity: "supplier",
      entityId: result.rows[0].id,
      details: { name: result.rows[0].name },
      ip: clientIp(req),
    });

    return NextResponse.json(
      { success: true, data: result.rows[0] },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating supplier:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create supplier" },
      { status: 500 },
    );
  }
}
