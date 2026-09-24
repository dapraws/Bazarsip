import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logAudit } from "@/lib/audit";
import { clientIp } from "@/lib/request";
import { revokeAllDevices } from "@/lib/trusted-device";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req, "admin");
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { password } = await req.json();

    const { rows } = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [authResult.user.userId],
    );

    // Requires the password again: someone who walks up to an unlocked
    // screen should not be able to strip the second factor off the account.
    const valid =
      rows[0] && (await bcrypt.compare(String(password ?? ""), rows[0].password));

    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Kata sandi salah" },
        { status: 401 },
      );
    }

    await pool.query(
      `UPDATE users
       SET totp_enabled = false, totp_secret = NULL,
           totp_last_step = NULL, recovery_codes = NULL
       WHERE id = $1`,
      [authResult.user.userId],
    );

    // A remembered browser is a standing pass through the second factor.
    // Turning the factor off must not leave those passes lying around.
    await revokeAllDevices(authResult.user.userId);

    await logAudit({
      action: "totp_disabled",
      actor: authResult.user,
      ip: clientIp(req),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("2FA disable error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal menonaktifkan" },
      { status: 500 },
    );
  }
}
