import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { normalizeWhatsapp } from "@/lib/whatsapp";

// PUT - Admin only
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth(req, "admin");
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { id } = await params;
    const { name, whatsapp, location, notes } = await req.json();

    if (!name || String(name).trim() === "") {
      return NextResponse.json(
        { success: false, error: "Supplier name is required" },
        { status: 400 },
      );
    }

    const result = await pool.query(
      `UPDATE suppliers
       SET name = $1, whatsapp = $2, location = $3, notes = $4
       WHERE id = $5
       RETURNING *`,
      [
        String(name).trim(),
        normalizeWhatsapp(whatsapp),
        location || null,
        notes || null,
        id,
      ],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Supplier not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error updating supplier:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update supplier" },
      { status: 500 },
    );
  }
}

// DELETE - Admin only. Products keep existing with no supplier attached.
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authResult = await requireAuth(req, "admin");
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { id } = await params;
    const result = await pool.query(
      "DELETE FROM suppliers WHERE id = $1 RETURNING id",
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Supplier not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ success: true, message: "Supplier deleted" });
  } catch (error) {
    console.error("Error deleting supplier:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete supplier" },
      { status: 500 },
    );
  }
}
