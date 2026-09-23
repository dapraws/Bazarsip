import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth, verifyAuth } from "@/lib/auth";

// Public URLs address products and categories by slug; the admin UI still
// links by id. slugify() never produces a purely numeric slug, so a numeric
// segment is unambiguously an id.
function byIdOrSlug(param: string, column: string) {
  return /^\d+$/.test(param)
    ? { clause: `${column}.id = $1`, value: Number(param) }
    : { clause: `${column}.slug = $1`, value: param };
}

// GET - Public route
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const lookup = byIdOrSlug(id, "p");

    const result = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug,
              s.name as supplier_name, s.whatsapp as supplier_whatsapp,
              s.location as supplier_location, s.notes as supplier_notes
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN suppliers s ON p.supplier_id = s.id
       WHERE ${lookup.clause}`,
      [lookup.value],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 },
      );
    }

    // Who supplies an item, and at what contact, is internal business
    // information. This route is public, so it is stripped for everyone
    // except admins.
    const { isValid, payload } = await verifyAuth(req);
    const product = result.rows[0];

    if (!isValid || payload?.role !== "admin") {
      delete product.supplier_id;
      delete product.supplier_name;
      delete product.supplier_whatsapp;
      delete product.supplier_location;
      delete product.supplier_notes;
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch product",
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
      supplier_id,
      availability,
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

    if (supplier_id !== undefined) {
      paramCount++;
      updates.push(`supplier_id = $${paramCount}`);
      values.push(supplier_id || null);
    }

    if (availability !== undefined) {
      if (!["ready", "preorder"].includes(availability)) {
        return NextResponse.json(
          { success: false, error: "Availability must be 'ready' or 'preorder'" },
          { status: 400 },
        );
      }
      paramCount++;
      updates.push(`availability = $${paramCount}`);
      values.push(availability);
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
      },
      { status: 500 },
    );
  }
}
