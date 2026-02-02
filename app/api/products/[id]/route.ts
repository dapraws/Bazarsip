import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET - Public route
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const result = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = $1`,
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product",
        message: error.message,
      },
      { status: 500 },
    );
  }
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
    const {
      name,
      slug,
      description,
      price,
      stock,
      image_url,
      images,
      category_id,
      is_active,
    } = body;

    // Check if product exists
    const existingProduct = await pool.query(
      "SELECT id FROM products WHERE id = $1",
      [id],
    );

    if (existingProduct.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 0;

    if (name !== undefined) {
      paramCount++;
      updates.push(`name = $${paramCount}`);
      values.push(name);
    }

    if (slug !== undefined) {
      paramCount++;
      updates.push(`slug = $${paramCount}`);
      values.push(slug);
    }

    if (description !== undefined) {
      paramCount++;
      updates.push(`description = $${paramCount}`);
      values.push(description);
    }

    if (price !== undefined) {
      paramCount++;
      updates.push(`price = $${paramCount}`);
      values.push(price);
    }

    if (stock !== undefined) {
      paramCount++;
      updates.push(`stock = $${paramCount}`);
      values.push(stock);
    }

    if (image_url !== undefined) {
      paramCount++;
      updates.push(`image_url = $${paramCount}`);
      values.push(image_url);
    }

    if (images !== undefined) {
      paramCount++;
      updates.push(`images = $${paramCount}`);
      values.push(images);
    }

    if (category_id !== undefined) {
      paramCount++;
      updates.push(`category_id = $${paramCount}`);
      values.push(category_id);
    }

    if (is_active !== undefined) {
      paramCount++;
      updates.push(`is_active = $${paramCount}`);
      values.push(is_active);
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
      UPDATE products 
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update product",
        message: error.message,
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

    // Check if product exists
    const product = await pool.query("SELECT id FROM products WHERE id = $1", [
      id,
    ]);

    if (product.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    // Delete product
    await pool.query("DELETE FROM products WHERE id = $1", [id]);

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete product",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
