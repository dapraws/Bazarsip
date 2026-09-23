import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { clientIp } from "@/lib/request";

const VALID_ROLES = ["customer", "admin"];

// Returns a reason string when the change would remove the caller's own
// access or leave the shop with no admin at all, otherwise null.
async function wouldLockOutAdmins(
  targetId: string,
  callerId: number,
): Promise<string | null> {
  if (String(callerId) === String(targetId)) {
    return "You cannot remove your own access";
  }

  const target = await pool.query("SELECT role FROM users WHERE id = $1", [
    targetId,
  ]);

  if (target.rows[0]?.role !== "admin") {
    return null;
  }

  const admins = await pool.query(
    "SELECT COUNT(*)::int AS count FROM users WHERE role = 'admin'",
  );

  return admins.rows[0].count <= 1 ? "This is the last admin account" : null;
}

// PUT - Admin only
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Require admin authentication
  const authResult = await requireAuth(req, "admin");
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { id } = await params;
    const body = await req.json();
    const { role, name, email } = body;

    if (role !== undefined && !VALID_ROLES.includes(role)) {
      return NextResponse.json(
        { success: false, error: `Role must be one of: ${VALID_ROLES.join(", ")}` },
        { status: 400 },
      );
    }

    if (role !== undefined && role !== "admin") {
      const lockout = await wouldLockOutAdmins(id, authResult.user.userId);
      if (lockout) {
        return NextResponse.json(
          { success: false, error: lockout },
          { status: 400 },
        );
      }
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (role !== undefined) {
      paramCount++;
      updates.push(`role = $${paramCount}`);
      values.push(role);
    }

    if (name !== undefined) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      values.push(name);
    }

    if (email !== undefined) {
      paramCount++;
      updates.push(`email = $${paramCount}`);
      values.push(email);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 },
      );
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    paramCount++;
    values.push(id);

    const query = `
      UPDATE users 
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING id, name, email, role, created_at, updated_at
    `;

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    await logAudit({
      action: "user_role_change",
      actor: authResult.user,
      entity: "user",
      entityId: result.rows[0].email,
      details: { role: result.rows[0].role },
      ip: clientIp(req),
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update user",
      },
      { status: 500 },
    );
  }
}

// DELETE - Admin only
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Require admin authentication
  const authResult = await requireAuth(req, "admin");
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { id } = await params;

    // Check if user exists
    const user = await pool.query("SELECT id FROM users WHERE id = $1", [id]);

    if (user.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 },
      );
    }

    const lockout = await wouldLockOutAdmins(id, authResult.user.userId);
    if (lockout) {
      return NextResponse.json(
        { success: false, error: lockout },
        { status: 400 },
      );
    }

    // orders.user_id cascades, so deleting a customer would take their whole
    // order history — and the sales figures — with it.
    const orders = await pool.query(
      "SELECT 1 FROM orders WHERE user_id = $1 LIMIT 1",
      [id],
    );

    if (orders.rows.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "This user has orders. Deleting them would erase that sales history.",
        },
        { status: 409 },
      );
    }

    await pool.query("DELETE FROM users WHERE id = $1", [id]);

    await logAudit({
      action: "user_delete",
      actor: authResult.user,
      entity: "user",
      entityId: id,
      ip: clientIp(req),
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete user",
      },
      { status: 500 },
    );
  }
}
