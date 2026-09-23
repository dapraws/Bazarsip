import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { generateSecret, otpauthUri } from "@/lib/totp";

// Staff only. Customers are not asked for a second factor: the friction
// would cost sales, and their account controls nothing but their own orders.
export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req, "admin");
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const secret = generateSecret();

    // Stored but not enabled. Until a correct code proves the app really
    // holds this secret, turning it on would lock the account out.
    await pool.query(
      "UPDATE users SET totp_secret = $1, totp_enabled = false WHERE id = $2",
      [secret, authResult.user.userId],
    );

    const uri = otpauthUri(secret, authResult.user.email, "Bazarsip");

    return NextResponse.json({
      success: true,
      data: {
        secret,
        qr: await QRCode.toDataURL(uri, { width: 240, margin: 1 }),
      },
    });
  } catch (error) {
    console.error("2FA setup error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menyiapkan verifikasi dua langkah" },
      { status: 500 },
    );
  }
}
