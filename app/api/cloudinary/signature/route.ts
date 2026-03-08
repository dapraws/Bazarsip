import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req);
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const body = await req.json();

    const paramsToSign: Record<string, any> = body.paramsToSign ?? body;

    const { signature: _sig, api_key: _ak, ...cleanParams } = paramsToSign;

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret) {
      return NextResponse.json(
        { success: false, error: "Missing CLOUDINARY_API_SECRET" },
        { status: 500 },
      );
    }

    const stringToSign = Object.keys(cleanParams)
      .sort()
      .map((key) => `${key}=${cleanParams[key]}`)
      .join("&");

    const signature = crypto
      .createHash("sha256")
      .update(stringToSign + apiSecret)
      .digest("hex");

    return NextResponse.json({ signature });
  } catch (error: any) {
    console.error("Cloudinary signature error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to generate signature" },
      { status: 500 },
    );
  }
}
