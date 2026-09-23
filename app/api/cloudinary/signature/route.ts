import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import crypto from "crypto";

// Folders each role is allowed to upload into. Customers only get their own
// avatar; everything that appears in the storefront is admin-managed.
const ALLOWED_FOLDERS: Record<string, string[]> = {
  admin: ["bazarsip/products", "bazarsip/categories", "bazarsip/users"],
  customer: ["bazarsip/users"],
};

// Params the upload widget is allowed to have signed. Anything else is
// rejected by name rather than dropped, so a widget change fails loudly
// instead of producing a signature that silently mismatches.
const SIGNABLE_PARAMS = ["timestamp", "folder", "source"];

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const body = await req.json();
    const params: Record<string, unknown> = body.paramsToSign ?? body;

    const unexpected = Object.keys(params).filter(
      (key) => !SIGNABLE_PARAMS.includes(key),
    );
    if (unexpected.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Parameter not allowed: ${unexpected.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const allowedFolders = ALLOWED_FOLDERS[authResult.user.role] ?? [];
    if (!allowedFolders.includes(String(params.folder))) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 },
      );
    }

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret) {
      console.error("CLOUDINARY_API_SECRET is not set");
      return NextResponse.json(
        { success: false, error: "Upload is not configured" },
        { status: 500 },
      );
    }

    const stringToSign = Object.keys(params)
      .sort()
      .map((key) => `${key}=${params[key]}`)
      .join("&");

    const signature = crypto
      .createHash("sha256")
      .update(stringToSign + apiSecret)
      .digest("hex");

    return NextResponse.json({ signature });
  } catch (error) {
    console.error("Cloudinary signature error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate signature" },
      { status: 500 },
    );
  }
}
