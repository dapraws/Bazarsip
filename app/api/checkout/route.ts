import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  const { cartId, userId } = await req.json();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1. Ambil cart items
    const cartItemsRes = await client.query(
      `
      SELECT ci.product_id, ci.quantity, p.price, p.stock
      FROM cart_items ci
      JOIN products p ON p.id = ci.product_id
      WHERE ci.cart_id = $1
      `,
      [cartId]
    );

    if (cartItemsRes.rows.length === 0) {
      throw new Error("Cart is empty");
    }

    // 2. Cek stok
    for (const item of cartItemsRes.rows) {
      if (item.stock < item.quantity) {
        throw new Error("Insufficient stock");
      }
    }

    // 3. Hitung total
    const total = cartItemsRes.rows.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 4. Buat order
    const orderRes = await client.query(
      `
      INSERT INTO orders (user_id, total)
      VALUES ($1, $2)
      RETURNING id
      `,
      [userId, total]
    );

    const orderId = orderRes.rows[0].id;

    // 5. Simpan order items & kurangi stok
    for (const item of cartItemsRes.rows) {
      await client.query(
        `
        INSERT INTO order_items (order_id, product_id, price, quantity)
        VALUES ($1, $2, $3, $4)
        `,
        [orderId, item.product_id, item.price, item.quantity]
      );

      await client.query(
        `
        UPDATE products
        SET stock = stock - $1
        WHERE id = $2
        `,
        [item.quantity, item.product_id]
      );
    }

    // 6. Clear cart
    await client.query("DELETE FROM cart_items WHERE cart_id = $1", [cartId]);

    await client.query("COMMIT");

    return NextResponse.json({ message: "Checkout success", orderId });
  } catch (err: any) {
    await client.query("ROLLBACK");
    return NextResponse.json(
      { error: err.message },
      { status: 400 }
    );
  } finally {
    client.release();
  }
}
