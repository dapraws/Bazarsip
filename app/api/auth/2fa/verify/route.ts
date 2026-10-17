import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { verifyCode } from "@/lib/totp";
import { consumeRecoveryCode } from "@/lib/recovery-codes";
import { issueSession, readChallenge } from "@/lib/session";
import { createRateLimiter } from "@/lib/rate-limit";
import { clientIp } from "@/lib/request";
import { logAudit } from "@/lib/audit";
import { trustDevice } from "@/lib/trusted-device";

// Six digits is a million combinations, and the drift window accepts three
// of them at any moment. Without a cap, guessing is a matter of minutes.
const codeLimiter = createRateLimiter(5, 15 * 60 * 1000);

export async function POST(req: NextRequest) {
  try {
    const { challenge, code, remember } = await req.json();
    const ip = clientIp(req);

    // The password flow posts the challenge; the Google flow cannot, because
    // it arrives back as a redirect, so it leaves one in an httpOnly cookie
    // rather than putting a credential in the URL.
    const token = challenge ?? req.cookies.get("pending_2fa")?.value;
    const userId = token ? readChallenge(token) : null;
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Sesi verifikasi kedaluwarsa. Masuk lagi." },
        { status: 401 },
      );
    }

    const throttled = codeLimiter.isBlocked(String(userId));
    if (throttled.blocked) {
      return NextResponse.json(
        { success: false, error: "Terlalu banyak percobaan. Coba lagi nanti." },
        {
          status: 429,
          headers: { "Retry-After": String(throttled.retryAfter) },
        },
      );
    }

    const { rows } = await pool.query(
      `SELECT id, name, email, role, totp_secret, totp_last_step, recovery_codes
       FROM users WHERE id = $1 AND totp_enabled = true`,
      [userId],
    );

    const user = rows[0];
    if (!user) {
      return NextResponse.json(
        { success: false, error: "Sesi verifikasi tidak berlaku" },
        { status: 401 },
      );
    }

    const submitted = String(code ?? "");
    const totp = verifyCode(user.totp_secret, submitted);

    if (totp.valid) {
      // A code stays valid for about 90 seconds across the window. Refusing
      // a step that was already accepted means someone who saw the screen
      // cannot reuse it.
      if (user.totp_last_step && Number(user.totp_last_step) >= totp.step) {
        codeLimiter.hit(String(userId));
        return NextResponse.json(
          { success: false, error: "Kode sudah dipakai. Tunggu kode berikutnya." },
          { status: 401 },
        );
      }

      await pool.query("UPDATE users SET totp_last_step = $1 WHERE id = $2", [
        totp.step,
        user.id,
      ]);
      codeLimiter.reset(String(userId));
      await logAudit({
        action: "login",
        actor: { userId: user.id, email: user.email },
        details: { factor: "totp", remembered: Boolean(remember) },
        ip,
      });

      const session = issueSession(user);
      session.cookies.delete("pending_2fa");
      if (remember) await trustDevice(user.id, req, session);
      return session;
    }

    // Not a valid code: it may be a recovery code instead.
    const recovery = await consumeRecoveryCode(submitted, user.recovery_codes);
    if (recovery.matched) {
      await pool.query("UPDATE users SET recovery_codes = $1 WHERE id = $2", [
        recovery.remaining,
        user.id,
      ]);
      codeLimiter.reset(String(userId));
      await logAudit({
        action: "login",
        actor: { userId: user.id, email: user.email },
        details: {
          factor: "recovery_code",
          remaining: recovery.remaining.length,
          remembered: Boolean(remember),
        },
        ip,
      });

      const session = issueSession(user);
      session.cookies.delete("pending_2fa");
      if (remember) await trustDevice(user.id, req, session);
      return session;
    }

    codeLimiter.hit(String(userId));
    await logAudit({
      action: "login_failed",
      entity: "user",
      entityId: user.email,
      details: { stage: "2fa" },
      ip,
    });

    return NextResponse.json(
      { success: false, error: "Kode salah" },
      { status: 401 },
    );
  } catch (error) {
    console.error("2FA verification error:", error);
    return NextResponse.json(
      { success: false, error: "Verifikasi gagal" },
      { status: 500 },
    );
  }
}
