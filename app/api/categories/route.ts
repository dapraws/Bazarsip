import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { slugify, nextFreeSlug } from "@/lib/slug";

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

    // Two items can legitimately share a name, so collisions get a numeric
    // suffix rather than an error the seller has to resolve.
    const slugBase = slugify(slug || name);
    const slugsInUse = await pool.query(
      "SELECT slug FROM categories WHERE slug = $1 OR slug LIKE $1 || '-%'",
      [slugBase],
    );

    const categorySlug = nextFreeSlug(
      slugBase,
      slugsInUse.rows.map((row) => row.slug),
    );

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
      },
      { status: 500 },
    );
  }
}
