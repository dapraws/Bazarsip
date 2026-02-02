import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET - Authenticated users only (customers see their own, admins see all)
export async function GET(req: NextRequest) {
  // Require authentication (any authenticated user)
  const authResult = await requireAuth(req);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const userId = searchParams.get("userId");

    let query = `
      SELECT 
        o.*,
        u.name as customer_name,
        u.email
      FROM orders o
      JOIN users u ON o.user_id = u.id
    `;

    const conditions: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    // If customer, only show their orders
    // If admin, show all orders or filtered by userId
    if (authResult.user.role === "customer") {
      paramCount++;
      conditions.push(`o.user_id = $${paramCount}`);
      values.push(authResult.user.userId);
    } else if (userId) {
      // Admin filtering by specific user
      paramCount++;
      conditions.push(`o.user_id = $${paramCount}`);
      values.push(userId);
    }

    if (status && status !== "all") {
      paramCount++;
      conditions.push(`o.status = $${paramCount}`);
      values.push(status);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }

    query += ` ORDER BY o.created_at DESC`;

    const result = await pool.query(query, values);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
        message: error.message,
      },
      { status: 500 },
    );
  }
}

// POST - Authenticated customers only
export async function POST(req: NextRequest) {
  // Require customer authentication
  const authResult = await requireAuth(req);
  if (!authResult.success) {
    return authResult.response;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const body = await req.json();
    const {
      items, // Array of { product_id, quantity }
      shipping_address,
      notes,
    } = body;

    // Use authenticated user's ID
    const user_id = authResult.user.userId;

    // Validate items
    if (!items || items.length === 0) {
      throw new Error("No items in order");
    }

    // Get product details and check stock
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const productResult = await client.query(
        "SELECT id, price, stock FROM products WHERE id = $1",
        [item.product_id],
      );

      if (productResult.rows.length === 0) {
        throw new Error(`Product ${item.product_id} not found`);
      }

      const product = productResult.rows[0];

      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.product_id}`);
      }

      const subtotal = product.price * item.quantity;
      total += subtotal;

      orderItems.push({
        product_id: item.product_id,
        price: product.price,
        quantity: item.quantity,
      });
    }

    // Create order
    const orderResult = await client.query(
      `INSERT INTO orders (user_id, total, shipping_address, notes, status, payment_status)
       VALUES ($1, $2, $3, $4, 'pending', 'unpaid')
       RETURNING id`,
      [user_id, total, shipping_address, notes || null],
    );

    const orderId = orderResult.rows[0].id;

    // Create order items and update stock
    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, price, quantity)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.price, item.quantity],
      );

      await client.query(
        `UPDATE products SET stock = stock - $1 WHERE id = $2`,
        [item.quantity, item.product_id],
      );
    }

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: { orderId, total },
      },
      { status: 201 },
    );
  } catch (error: any) {
    await client.query("ROLLBACK");
    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create order",
        message: error.message,
      },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
