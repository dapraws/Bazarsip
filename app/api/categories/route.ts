import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET - Public route
export async function GET(req: NextRequest) {
  try {
    const result = await pool.query(`
      SELECT 
        c.*,
        COUNT(p.id) as product_count
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id AND p.is_active = true
      GROUP BY c.id
      ORDER BY c.name ASC
    `);

    return NextResponse.json({
      success: true,
      data: result.rows,
    });
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
        message: error.message,
      },
      { status: 500 },
    );
  }
}

// POST - Admin only
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req, "admin");
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const body = await req.json();
    const { name, slug, description, image_url } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Category name is required" },
        { status: 400 },
      );
    }

    // Generate slug if not provided
    const categorySlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Check if slug exists
    const slugCheck = await pool.query(
      "SELECT id FROM categories WHERE slug = $1",
      [categorySlug],
    );

    if (slugCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: "Category with this slug already exists" },
        { status: 409 },
      );
    }

    const result = await pool.query(
      `INSERT INTO categories (name, slug, description, image_url)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, categorySlug, description || null, image_url || null],
    );

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully",
        data: result.rows[0],
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create category",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
