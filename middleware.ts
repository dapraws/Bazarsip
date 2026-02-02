import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose"; // Ensure you are using 'jose' as discussed

interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value;
  const { pathname } = request.nextUrl;

  const adminPaths = [
    "/dashboard",
    "/users",
    "/categories",
    "/orders",
    "/products",
  ];
  const customerPaths = [
    "/shop",
    "/cart",
    "/checkout",
    "/my-orders",
    "/profile",
  ];
  const publicPaths = ["/login", "/register"];

  const isAdminRoute = adminPaths.some((path) => pathname.startsWith(path));
  const isCustomerRoute = customerPaths.some((path) =>
    pathname.startsWith(path),
  );
  const isPublicRoute = publicPaths.some((path) => pathname.startsWith(path));

  let userRole: string | null = null;
  if (sessionToken) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(sessionToken, secret);
      console.log("LOGGED ROLE:", payload.role);
      const decoded = payload as unknown as JWTPayload;
      userRole = decoded.role; // Ensure this is exactly "admin" (lowercase) in your DB
    } catch (error) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("session");
      return response;
    }
  }

  if (!sessionToken && (isAdminRoute || isCustomerRoute)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (sessionToken && isPublicRoute) {
    if (userRole === "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/shop", request.url));
    }
  }

  if (isAdminRoute && userRole !== "admin") {
    return NextResponse.redirect(new URL("/shop", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Admin Routes
    "/dashboard/:path*",
    "/users/:path*",
    "/categories/:path*",
    "/orders/:path*",
    "/products/:path*",

    // Customer Routes
    "/shop/:path*",
    "/cart/:path*",
    "/checkout/:path*",
    "/my-orders/:path*",
    "/profile/:path*",

    // Auth Routes
    "/login",
    "/register",
  ],
};
