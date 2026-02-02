import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET - Authenticated users (customers can only see their own, admins see all)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Require authentication
  const authResult = await requireAuth(req);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { id } = await params;

    // Get order details
    const orderResult = await pool.query(
      `SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email
       FROM orders o
       JOIN users u ON o.user_id = u.id
       WHERE o.id = $1`,
      [id],
    );

    if (orderResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    const order = orderResult.rows[0];

    // Check authorization: customers can only see their own orders
    if (
      authResult.user.role === "customer" &&
      order.user_id !== authResult.user.userId
    ) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    // Get order items
    const itemsResult = await pool.query(
      `SELECT 
        oi.*,
        p.name as product_name,
        p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
      [id],
    );

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        items: itemsResult.rows,
      },
    });
  } catch (error: any) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch order",
        message: error.message,
      },
      { status: 500 },
    );
  }
}

// PUT - Admin only (for updating order status)
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
    const { status, payment_status } = body;

    // Check if order exists
    const orderCheck = await pool.query("SELECT id FROM orders WHERE id = $1", [
      id,
    ]);

    if (orderCheck.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (status !== undefined) {
      paramCount++;
      updates.push(`status = $${paramCount}`);
      values.push(status);
    }

    if (payment_status !== undefined) {
      paramCount++;
      updates.push(`payment_status = $${paramCount}`);
      values.push(payment_status);
    }

    if (updates.length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields to update" },
        { status: 400 },
      );
    }

    // Add updated_at
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add ID parameter
    paramCount++;
    values.push(id);

    const query = `
      UPDATE orders 
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    return NextResponse.json({
      success: true,
      message: "Order updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update order",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
