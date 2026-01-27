import { NextResponse } from "next/server";
import { pool } from "@/lib/db";

export async function POST(req: Request) {
  const { cartId, productId, quantity } = await req.json();

  await pool.query(
    `
    INSERT INTO cart_items (cart_id, product_id, quantity)
    VALUES ($1, $2, $3)
    ON CONFLICT (cart_id, product_id)
    DO UPDATE SET quantity = cart_items.quantity + $3
    `,
    [cartId, productId, quantity],
  );

  return NextResponse.json({ message: "Added to cart" });
}
