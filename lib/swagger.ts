/**
 * Swagger/OpenAPI Configuration
 * This file contains the OpenAPI specification for the Bazarsip E-commerce API
 */

export const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Bazarsip E-commerce API",
    version: "1.0.0",
    description:
      "Complete API documentation for Bazarsip e-commerce platform with JWT authentication",
    contact: {
      name: "Bazarsip Support",
      email: "support@bazarsip.com",
    },
  },
  servers: [
    {
      url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
      description: "Development server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "Enter your JWT token in the format: your-token-here",
      },
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "session",
        description: "Session cookie with JWT token",
      },
    },
    schemas: {
      Error: {
        type: "object",
        properties: {
          success: {
            type: "boolean",
            example: false,
          },
          error: {
            type: "string",
            example: "Error message",
          },
          message: {
            type: "string",
            example: "Detailed error message",
          },
        },
      },
      User: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          name: {
            type: "string",
            example: "John Doe",
          },
          email: {
            type: "string",
            example: "user@example.com",
          },
          role: {
            type: "string",
            enum: ["customer", "admin"],
            example: "customer",
          },
          created_at: {
            type: "string",
            format: "date-time",
          },
          updated_at: {
            type: "string",
            format: "date-time",
          },
        },
      },
      Category: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          name: {
            type: "string",
            example: "Electronics",
          },
          slug: {
            type: "string",
            example: "electronics",
          },
          description: {
            type: "string",
            example: "Electronic devices and gadgets",
          },
          image_url: {
            type: "string",
            example: "https://example.com/image.jpg",
          },
          product_count: {
            type: "integer",
            example: 10,
          },
          created_at: {
            type: "string",
            format: "date-time",
          },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          name: {
            type: "string",
            example: "Gaming Laptop",
          },
          slug: {
            type: "string",
            example: "gaming-laptop",
          },
          description: {
            type: "string",
            example: "High-performance gaming laptop",
          },
          price: {
            type: "number",
            format: "decimal",
            example: 15000000.0,
          },
          stock: {
            type: "integer",
            example: 25,
          },
          image_url: {
            type: "string",
            example: "https://example.com/product.jpg",
          },
          images: {
            type: "array",
            items: {
              type: "string",
            },
            example: [
              "https://example.com/img1.jpg",
              "https://example.com/img2.jpg",
            ],
          },
          category_id: {
            type: "integer",
            example: 1,
          },
          category_name: {
            type: "string",
            example: "Electronics",
          },
          is_active: {
            type: "boolean",
            example: true,
          },
          created_at: {
            type: "string",
            format: "date-time",
          },
        },
      },
      Order: {
        type: "object",
        properties: {
          id: {
            type: "integer",
            example: 1,
          },
          user_id: {
            type: "integer",
            example: 1,
          },
          customer_name: {
            type: "string",
            example: "John Doe",
          },
          customer_email: {
            type: "string",
            example: "customer@example.com",
          },
          total: {
            type: "number",
            format: "decimal",
            example: 15000000.0,
          },
          status: {
            type: "string",
            enum: [
              "pending",
              "paid",
              "processing",
              "shipped",
              "delivered",
              "cancelled",
            ],
            example: "pending",
          },
          payment_status: {
            type: "string",
            enum: ["unpaid", "paid", "failed", "refunded"],
            example: "unpaid",
          },
          shipping_address: {
            type: "string",
            example: "123 Main St, Jakarta, Indonesia",
          },
          notes: {
            type: "string",
            example: "Please handle with care",
          },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "integer" },
                product_id: { type: "integer" },
                product_name: { type: "string" },
                price: { type: "number" },
                quantity: { type: "integer" },
                image_url: { type: "string" },
              },
            },
          },
          created_at: {
            type: "string",
            format: "date-time",
          },
        },
      },
    },
  },
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register a new user",
        description: "Create a new customer account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password", "name"],
                properties: {
                  name: {
                    type: "string",
                    example: "John Doe",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    example: "user@example.com",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    minLength: 8,
                    example: "SecurePass123!",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "User registered successfully",
                    },
                    user: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Bad request - validation error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          409: {
            description: "Conflict - user already exists",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login user",
        description: "Authenticate user and receive JWT token in cookie",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    example: "admin@bazarsip.com",
                  },
                  password: {
                    type: "string",
                    format: "password",
                    example: "admin123",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            headers: {
              "Set-Cookie": {
                schema: {
                  type: "string",
                  example:
                    "session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly",
                },
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    user: {
                      $ref: "#/components/schemas/User",
                    },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized - invalid credentials",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },
    "/api/auth/me": {
      get: {
        tags: ["Authentication"],
        summary: "Get current user",
        description: "Get authenticated user information",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "User information retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    user: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/categories": {
      get: {
        tags: ["Categories"],
        summary: "Get all categories",
        description: "Retrieve list of all product categories",
        responses: {
          200: {
            description: "Categories retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Category" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Categories"],
        summary: "Create category",
        description: "Create a new product category (Admin only)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name"],
                properties: {
                  name: { type: "string", example: "Gaming" },
                  slug: { type: "string", example: "gaming" },
                  description: { type: "string", example: "Gaming products" },
                  image_url: {
                    type: "string",
                    example: "https://example.com/gaming.jpg",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Category created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: { $ref: "#/components/schemas/Category" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden - Admin only" },
        },
      },
    },
    "/api/categories/{id}": {
      get: {
        tags: ["Categories"],
        summary: "Get category by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Category retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Category" },
                  },
                },
              },
            },
          },
          404: { description: "Category not found" },
        },
      },
      put: {
        tags: ["Categories"],
        summary: "Update category",
        description: "Update category details (Admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  image_url: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Category updated" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Not found" },
        },
      },
      delete: {
        tags: ["Categories"],
        summary: "Delete category",
        description: "Delete a category (Admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Category deleted" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Not found" },
        },
      },
    },
    "/api/products": {
      get: {
        tags: ["Products"],
        summary: "Get all products",
        description:
          "Retrieve paginated list of products with optional filters",
        parameters: [
          {
            name: "page",
            in: "query",
            schema: { type: "integer", default: 1 },
          },
          {
            name: "limit",
            in: "query",
            schema: { type: "integer", default: 10 },
          },
          {
            name: "search",
            in: "query",
            schema: { type: "string" },
            description: "Search in product name and description",
          },
          {
            name: "categoryId",
            in: "query",
            schema: { type: "integer" },
            description: "Filter by category ID",
          },
        ],
        responses: {
          200: {
            description: "Products retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Product" },
                    },
                    pagination: {
                      type: "object",
                      properties: {
                        page: { type: "integer" },
                        limit: { type: "integer" },
                        total: { type: "integer" },
                        totalPages: { type: "integer" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Products"],
        summary: "Create product",
        description: "Create a new product (Admin only)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "price", "category_id"],
                properties: {
                  name: { type: "string", example: "Gaming Mouse" },
                  slug: { type: "string", example: "gaming-mouse" },
                  description: { type: "string" },
                  price: { type: "number", example: 500000 },
                  stock: { type: "integer", example: 50 },
                  image_url: { type: "string" },
                  images: { type: "array", items: { type: "string" } },
                  category_id: { type: "integer", example: 1 },
                  is_active: { type: "boolean", default: true },
                },
              },
            },
          },
        },
        responses: {
          201: { description: "Product created" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "Get product by ID",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Product retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Product" },
                  },
                },
              },
            },
          },
          404: { description: "Product not found" },
        },
      },
      put: {
        tags: ["Products"],
        summary: "Update product",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  price: { type: "number" },
                  stock: { type: "integer" },
                  image_url: { type: "string" },
                  images: { type: "array", items: { type: "string" } },
                  category_id: { type: "integer" },
                  is_active: { type: "boolean" },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Product updated" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Not found" },
        },
      },
      delete: {
        tags: ["Products"],
        summary: "Delete product",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "Product deleted" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Not found" },
        },
      },
    },
    "/api/orders": {
      get: {
        tags: ["Orders"],
        summary: "Get orders",
        description: "Get all orders (Admin) or user's orders (Customer)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "status",
            in: "query",
            schema: {
              type: "string",
              enum: [
                "all",
                "pending",
                "paid",
                "processing",
                "shipped",
                "delivered",
                "cancelled",
              ],
            },
          },
          {
            name: "userId",
            in: "query",
            schema: { type: "integer" },
            description: "Filter by user ID (Admin only)",
          },
        ],
        responses: {
          200: {
            description: "Orders retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Order" },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
        },
      },
      post: {
        tags: ["Orders"],
        summary: "Create order",
        description: "Create a new order (Customer only)",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["items", "shipping_address"],
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        product_id: { type: "integer" },
                        quantity: { type: "integer" },
                      },
                    },
                    example: [
                      { product_id: 1, quantity: 2 },
                      { product_id: 3, quantity: 1 },
                    ],
                  },
                  shipping_address: {
                    type: "string",
                    example: "123 Main St, Jakarta, Indonesia",
                  },
                  notes: {
                    type: "string",
                    example: "Please handle with care",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Order created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                    data: {
                      type: "object",
                      properties: {
                        orderId: { type: "integer" },
                        total: { type: "number" },
                      },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          400: { description: "Bad request" },
        },
      },
    },
    "/api/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "Get order by ID",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: {
            description: "Order retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Order" },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Not found" },
        },
      },
      put: {
        tags: ["Orders"],
        summary: "Update order status",
        description: "Update order status (Admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  status: {
                    type: "string",
                    enum: [
                      "pending",
                      "paid",
                      "processing",
                      "shipped",
                      "delivered",
                      "cancelled",
                    ],
                  },
                  payment_status: {
                    type: "string",
                    enum: ["unpaid", "paid", "failed", "refunded"],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Order updated" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Not found" },
        },
      },
    },
    "/api/users": {
      get: {
        tags: ["Users"],
        summary: "Get all users",
        description: "Get list of all users (Admin only)",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Users retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/User" },
                    },
                  },
                },
              },
            },
          },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
        },
      },
    },
    "/api/users/{id}": {
      put: {
        tags: ["Users"],
        summary: "Update user",
        description: "Update user details (Admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        requestBody: {
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  email: { type: "string" },
                  role: {
                    type: "string",
                    enum: ["customer", "admin"],
                  },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "User updated" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Not found" },
        },
      },
      delete: {
        tags: ["Users"],
        summary: "Delete user",
        description: "Delete a user (Admin only)",
        security: [{ cookieAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "integer" },
          },
        ],
        responses: {
          200: { description: "User deleted" },
          401: { description: "Unauthorized" },
          403: { description: "Forbidden" },
          404: { description: "Not found" },
        },
      },
    },
  },
  tags: [
    {
      name: "Authentication",
      description: "User authentication and authorization endpoints",
    },
    {
      name: "Categories",
      description: "Product category management",
    },
    {
      name: "Products",
      description: "Product catalog management",
    },
    {
      name: "Orders",
      description: "Order management and processing",
    },
    {
      name: "Users",
      description: "User management (Admin only)",
    },
  ],
};
