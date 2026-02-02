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
      `SELECT c.*, COUNT(p.id) as product_count
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
       WHERE c.id = $1
       GROUP BY c.id`,
      [id],
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch category",
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
    const { name, slug, description, image_url } = body;

    // Check if category exists
    const existingCategory = await pool.query(
      "SELECT id FROM categories WHERE id = $1",
      [id],
    );

    if (existingCategory.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
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

      // Auto-generate slug if name changed
      const newSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      paramCount++;
      updates.push(`slug = $${paramCount}`);
      values.push(newSlug);
    }

    if (description !== undefined) {
      paramCount++;
      updates.push(`description = $${paramCount}`);
      values.push(description);
    }

    if (image_url !== undefined) {
      paramCount++;
      updates.push(`image_url = $${paramCount}`);
      values.push(image_url);
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
      UPDATE categories 
      SET ${updates.join(", ")}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, values);

    return NextResponse.json({
      success: true,
      message: "Category updated successfully",
      data: result.rows[0],
    });
  } catch (error: any) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update category",
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

    // Check if category exists
    const category = await pool.query(
      "SELECT id FROM categories WHERE id = $1",
      [id],
    );

    if (category.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "Category not found" },
        { status: 404 },
      );
    }

    // Delete category (CASCADE will delete related products)
    await pool.query("DELETE FROM categories WHERE id = $1", [id]);

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete category",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
