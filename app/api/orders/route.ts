import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { UserError } from "@/lib/errors";
import { generateOrderNumber } from "@/lib/order-number";

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
      throw new UserError("No items in order");
    }

    // Get product details and check stock
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const productResult = await client.query(
        "SELECT id, price, stock FROM products WHERE id = $1 AND is_active = true",
        [item.product_id],
      );

      if (productResult.rows.length === 0) {
        throw new UserError(`Product ${item.product_id} not available`);
      }

      const product = productResult.rows[0];

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
      `INSERT INTO orders (user_id, total, shipping_address, notes, status, payment_status, order_number)
       VALUES ($1, $2, $3, $4, 'pending', 'unpaid', $5)
       RETURNING id, order_number`,
      [
        user_id,
        total,
        shipping_address,
        notes || null,
        generateOrderNumber(),
      ],
    );

    const orderId = orderResult.rows[0].id;
    const orderNumber = orderResult.rows[0].order_number;

    // Create order items and update stock
    for (const item of orderItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, price, quantity)
         VALUES ($1, $2, $3, $4)`,
        [orderId, item.product_id, item.price, item.quantity],
      );

      // Guard the decrement itself: checking stock in a separate SELECT
      // leaves a window where a concurrent order can take the same units
      // and drive stock negative.
      const stockUpdate = await client.query(
        `UPDATE products SET stock = stock - $1 WHERE id = $2 AND stock >= $1`,
        [item.quantity, item.product_id],
      );

      if (stockUpdate.rowCount === 0) {
        throw new UserError(`Insufficient stock for product ${item.product_id}`);
      }
    }

    await client.query("COMMIT");

    return NextResponse.json(
      {
        success: true,
        message: "Order created successfully",
        data: { orderId, orderNumber, total },
      },
      { status: 201 },
    );
  } catch (error: any) {
    await client.query("ROLLBACK");

    if (error instanceof UserError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: error.status },
      );
    }

    console.error("Error creating order:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create order",
      },
      { status: 500 },
    );
  } finally {
    client.release();
  }
}
