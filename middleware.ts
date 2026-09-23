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
    "/suppliers",
  ];
  // /shop is deliberately absent: the catalogue is the point of the site.
  // Customers arrive from a WhatsApp link, and requiring an account before
  // they can see a single item would stop them there — and leave search
  // engines with nothing to index.
  const customerPaths = [
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
      const decoded = payload as unknown as JWTPayload;
      userRole = decoded.role;
    } catch {
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
    "/suppliers/:path*",

    // Customer Routes
    "/cart/:path*",
    "/checkout/:path*",
    "/my-orders/:path*",
    "/profile/:path*",

    // Auth Routes
    "/login",
    "/register",
  ],
};
