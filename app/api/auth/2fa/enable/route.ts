import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { verifyCode } from "@/lib/totp";
import {
  generateRecoveryCodes,
  hashRecoveryCodes,
} from "@/lib/recovery-codes";
import { logAudit } from "@/lib/audit";
import { clientIp } from "@/lib/request";

export async function POST(req: NextRequest) {
  const authResult = await requireAuth(req, "admin");
  if (!authResult.success) {
    return authResult.response;
  }

  try {
    const { code } = await req.json();

    const { rows } = await pool.query(
      "SELECT totp_secret FROM users WHERE id = $1",
      [authResult.user.userId],
    );

    const secret = rows[0]?.totp_secret;
    if (!secret) {
      return NextResponse.json(
        { success: false, error: "Mulai dari awal: belum ada kode QR." },
        { status: 400 },
      );
    }

    // Proving one correct code before switching it on is the whole point of
    // a separate enable step: a mistyped or unscanned secret would otherwise
    // lock the account at the next sign-in.
    const result = verifyCode(secret, String(code ?? ""));
    if (!result.valid) {
      return NextResponse.json(
        { success: false, error: "Kode salah. Coba kode yang sedang tampil." },
        { status: 400 },
      );
    }

    const codes = generateRecoveryCodes();

    await pool.query(
      `UPDATE users
       SET totp_enabled = true, totp_last_step = $1, recovery_codes = $2
       WHERE id = $3`,
      [result.step, await hashRecoveryCodes(codes), authResult.user.userId],
    );

    await logAudit({
      action: "totp_enabled",
      actor: authResult.user,
      ip: clientIp(req),
    });

    // The only time the plaintext exists. Stored hashed, so it cannot be
    // shown again.
    return NextResponse.json({ success: true, data: { recoveryCodes: codes } });
  } catch (error) {
    console.error("2FA enable error:", error);
    return NextResponse.json(
      { success: false, error: "Gagal mengaktifkan" },
      { status: 500 },
    );
  }
}
