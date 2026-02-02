import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// GET - Public route (no auth required)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const offset = (page - 1) * limit;

    // Build WHERE clause
    const conditions: string[] = ["p.is_active = true"];
    const values: any[] = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      conditions.push(
        `(p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`,
      );
      values.push(`%${search}%`);
    }

    if (categoryId) {
      paramCount++;
      conditions.push(`p.category_id = $${paramCount}`);
      values.push(categoryId);
    }

    const whereClause = conditions.join(" AND ");

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM products p WHERE ${whereClause}`;
    const countResult = await pool.query(countQuery, values);
    const total = parseInt(countResult.rows[0].count);

    // Get products with pagination
    paramCount++;
    const limitParam = paramCount;
    paramCount++;
    const offsetParam = paramCount;

    const query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    const result = await pool.query(query, [...values, limit, offset]);

    return NextResponse.json({
      success: true,
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
        message: error.message,
      },
      { status: 500 },
    );
  }
}

// POST - Admin only
export async function POST(req: NextRequest) {
  // Require admin authentication
  const authResult = await requireAuth(req, "admin");
  if (!authResult.success) {
    return authResult.response;
  }

  try {
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

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Product name is required" },
        { status: 400 },
      );
    }

    // Generate slug if not provided
    const productSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    // Check if slug exists
    const slugCheck = await pool.query(
      "SELECT id FROM products WHERE slug = $1",
      [productSlug],
    );

    if (slugCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: "Product with this slug already exists" },
        { status: 409 },
      );
    }

    const result = await pool.query(
      `INSERT INTO products (name, slug, description, price, stock, image_url, images, category_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        name,
        productSlug,
        description || null,
        price || 0,
        stock || 0,
        image_url || null,
        images || [],
        category_id || null,
        is_active !== undefined ? is_active : true,
      ],
    );

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully",
        data: result.rows[0],
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create product",
        message: error.message,
      },
      { status: 500 },
    );
  }
}
