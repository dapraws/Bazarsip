import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

export interface JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export async function verifyAuth(request: NextRequest): Promise<{
  isValid: boolean;
  payload?: JWTPayload;
  error?: string;
}> {
  const token = request.cookies.get("session")?.value;

  if (!token) {
    return { isValid: false, error: "No token provided" };
  }

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return {
      isValid: true,
      payload: payload as unknown as JWTPayload,
    };
  } catch (error) {
    return { isValid: false, error: "Invalid token" };
  }
}

export async function requireAuth(
  request: NextRequest,
  requiredRole?: "admin" | "customer",
): Promise<
  | { success: true; user: JWTPayload }
  | { success: false; response: NextResponse }
> {
  const authResult = await verifyAuth(request);

  if (!authResult.isValid || !authResult.payload) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Unauthorized", message: authResult.error },
        { status: 401 },
      ),
    };
  }

  // Check role if required
  if (requiredRole && authResult.payload.role !== requiredRole) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Forbidden", message: "Insufficient permissions" },
        { status: 403 },
      ),
    };
  }

  return { success: true, user: authResult.payload };
}
