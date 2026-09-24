import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { revokeAllDevices } from "@/lib/trusted-device";
import { logAudit } from "@/lib/audit";
import { clientIp } from "@/lib/request";

export async function GET(req: NextRequest) {
  const authResult = await requireAuth(req, "admin");
  if (!authResult.success) {
    return authResult.response;
  }

  const { rows } = await pool.query(
    `SELECT id, label, last_used_at, expires_at
     FROM trusted_devices
     WHERE user_id = $1 AND expires_at > CURRENT_TIMESTAMP
     ORDER BY last_used_at DESC`,
    [authResult.user.userId],
  );

  return NextResponse.json({ success: true, data: rows });
}

// Forgets every remembered browser. Deliberately all-or-nothing: picking the
// right row out of a list is guesswork for someone whose phone was just
// stolen, and "forget everything" is the answer they actually want.
export async function DELETE(req: NextRequest) {
  const authResult = await requireAuth(req, "admin");
  if (!authResult.success) {
    return authResult.response;
  }

  const removed = await revokeAllDevices(authResult.user.userId);

  await logAudit({
    action: "totp_devices_revoked",
    actor: authResult.user,
    details: { removed },
    ip: clientIp(req),
  });

  return NextResponse.json({ success: true, data: { removed } });
}
