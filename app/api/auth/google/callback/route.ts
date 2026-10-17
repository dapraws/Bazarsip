import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import {
  exchangeCode,
  isGoogleConfigured,
  publicOrigin,
  STATE_COOKIE,
} from "@/lib/google-oauth";
import { issueSession, issueChallenge } from "@/lib/session";
import { isDeviceTrusted } from "@/lib/trusted-device";
import { logAudit } from "@/lib/audit";
import { clientIp } from "@/lib/request";

export const PENDING_2FA_COOKIE = "pending_2fa";

function back(req: NextRequest, error: string) {
  return NextResponse.redirect(new URL(`/login?error=${error}`, req.url));
}

export async function GET(req: NextRequest) {
  if (!isGoogleConfigured()) return back(req, "google_tidak_tersedia");

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expected = req.cookies.get(STATE_COOKIE)?.value;

  // Someone who can get a victim to open a prepared callback URL could
  // otherwise sign them into an attacker's account.
  if (!code || !state || !expected || state !== expected) {
    return back(req, "verifikasi_gagal");
  }

  try {
    const profile = await exchangeCode(code, publicOrigin(req));
    if (!profile) return back(req, "google_gagal");

    // Linking an existing account by email is only safe because Google says
    // it verified that address. An unverified one would let anyone claim a
    // shop account by signing up with its email.
    if (!profile.emailVerified) return back(req, "email_belum_terverifikasi");

    const existing = await pool.query(
      `SELECT id, name, email, role, totp_enabled, google_id
       FROM users WHERE google_id = $1 OR email = $2
       ORDER BY (google_id = $1) DESC
       LIMIT 1`,
      [profile.sub, profile.email],
    );

    let user = existing.rows[0];

    if (!user) {
      // New accounts are always customers. A role is something the shop
      // grants, never something a sign-in provider decides.
      const created = await pool.query(
        `INSERT INTO users (name, email, google_id, role)
         VALUES ($1, $2, $3, 'customer')
         RETURNING id, name, email, role, totp_enabled`,
        [profile.name ?? profile.email.split("@")[0], profile.email, profile.sub],
      );
      user = created.rows[0];

      await logAudit({
        action: "google_signup",
        actor: { userId: user.id, email: user.email },
        ip: clientIp(req),
      });
    } else if (!user.google_id) {
      await pool.query("UPDATE users SET google_id = $1 WHERE id = $2", [
        profile.sub,
        user.id,
      ]);

      await logAudit({
        action: "google_linked",
        actor: { userId: user.id, email: user.email },
        ip: clientIp(req),
      });
    }

    // Google replaces the password, not the second factor. An admin who
    // turned on two-factor still proves possession of their phone;
    // otherwise the protection would quietly become "whoever holds the
    // Google account".
    if (user.totp_enabled && !(await isDeviceTrusted(user.id, req))) {
      const response = NextResponse.redirect(new URL("/login?verify=1", req.url));
      response.cookies.set(PENDING_2FA_COOKIE, issueChallenge(user.id), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 300,
        path: "/",
      });
      response.cookies.delete(STATE_COOKIE);
      return response;
    }

    await logAudit({
      action: "login",
      actor: { userId: user.id, email: user.email },
      details: { factor: "google" },
      ip: clientIp(req),
    });

    const landing = user.role === "admin" ? "/dashboard" : "/shop";
    const session = issueSession(user);
    const response = NextResponse.redirect(new URL(landing, req.url));

    for (const cookie of session.cookies.getAll()) {
      response.cookies.set(cookie);
    }
    response.cookies.delete(STATE_COOKIE);

    return response;
  } catch (error) {
    console.error("Google callback error:", error);
    return back(req, "google_gagal");
  }
}
