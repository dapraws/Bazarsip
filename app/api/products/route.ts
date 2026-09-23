import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth, verifyAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { clientIp } from "@/lib/request";
import { slugify, nextFreeSlug } from "@/lib/slug";
import { GENDERS, AGE_GROUPS, STYLES } from "@/lib/labels";

// The CHECK constraints reject a bad value, but as a 500. Validating here
// turns that into an answer the caller can act on.
const FACET_VALUES: Record<string, readonly string[]> = {
  gender: GENDERS,
  age_group: AGE_GROUPS,
  style: STYLES,
};

function invalidFacet(facets: Record<string, unknown>): string | null {
  for (const [field, value] of Object.entries(facets)) {
    if (value === undefined || value === null || value === "") continue;
    const allowed = FACET_VALUES[field];
    if (allowed && !allowed.includes(String(value))) {
      return `${field} harus salah satu dari: ${allowed.join(", ")}`;
    }
  }
  return null;
}


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

    // Browsing axes. The column names are fixed here, never taken from the
    // query string, and every value is still passed as a parameter.
    for (const facet of ["gender", "age_group", "style"] as const) {
      const value = searchParams.get(facet);
      if (!value) continue;
      paramCount++;
      conditions.push(`p.${facet} = $${paramCount}`);
      values.push(value);
    }

    const brand = searchParams.get("brand");
    if (brand) {
      paramCount++;
      conditions.push(`p.brand ILIKE $${paramCount}`);
      values.push(brand);
    }

    // The shop page has always sent these; nothing read them, so the price
    // slider and the sort control did nothing.
    const minPrice = searchParams.get("minPrice");
    if (minPrice && !Number.isNaN(Number(minPrice))) {
      paramCount++;
      conditions.push(`p.price >= $${paramCount}`);
      values.push(Number(minPrice));
    }

    const maxPrice = searchParams.get("maxPrice");
    if (maxPrice && !Number.isNaN(Number(maxPrice))) {
      paramCount++;
      conditions.push(`p.price <= $${paramCount}`);
      values.push(Number(maxPrice));
    }

    const ORDER_BY: Record<string, string> = {
      newest: "p.created_at DESC",
      price_asc: "p.price ASC",
      price_desc: "p.price DESC",
    };
    const orderBy =
      ORDER_BY[searchParams.get("sort") ?? "newest"] ?? ORDER_BY.newest;

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

    // Supplier details are internal; this route is public.
    const { isValid, payload } = await verifyAuth(req);
    const isAdmin = isValid && payload?.role === "admin";

    const query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
             ${isAdmin ? ", s.name as supplier_name, s.whatsapp as supplier_whatsapp" : ""}
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${isAdmin ? "LEFT JOIN suppliers s ON p.supplier_id = s.id" : ""}
      WHERE ${whereClause}
      ORDER BY ${orderBy}
      LIMIT $${limitParam} OFFSET $${offsetParam}
    `;

    const result = await pool.query(query, [...values, limit, offset]);

    if (!isAdmin) {
      for (const row of result.rows) delete row.supplier_id;
    }

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
      supplier_id,
      availability,
      gender,
      age_group,
      style,
      brand,
    } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, error: "Product name is required" },
        { status: 400 },
      );
    }

    const facetError = invalidFacet({ gender, age_group, style });
    if (facetError) {
      return NextResponse.json(
        { success: false, error: facetError },
        { status: 400 },
      );
    }

    // Two items can legitimately share a name, so collisions get a numeric
    // suffix rather than an error the seller has to resolve.
    const slugBase = slugify(slug || name);
    const slugsInUse = await pool.query(
      "SELECT slug FROM products WHERE slug = $1 OR slug LIKE $1 || '-%'",
      [slugBase],
    );

    const productSlug = nextFreeSlug(
      slugBase,
      slugsInUse.rows.map((row) => row.slug),
    );

    const result = await pool.query(
      `INSERT INTO products (name, slug, description, price, stock, image_url, images, category_id, is_active, supplier_id, availability, gender, age_group, style, brand)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
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
        supplier_id || null,
        availability === "preorder" ? "preorder" : "ready",
        gender || null,
        age_group || null,
        style || null,
        brand?.trim() || null,
      ],
    );

    await logAudit({
      action: "product_create",
      actor: authResult.user,
      entity: "product",
      entityId: result.rows[0].id,
      details: { name: result.rows[0].name, price: result.rows[0].price },
      ip: clientIp(req),
    });

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
      },
      { status: 500 },
    );
  }
}
