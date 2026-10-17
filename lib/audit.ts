import { pool } from "@/lib/db";
import type { JWTPayload } from "@/lib/auth";

export type AuditAction =
  | "login"
  | "login_failed"
  | "logout"
  | "product_create"
  | "product_update"
  | "product_delete"
  | "category_create"
  | "category_update"
  | "category_delete"
  | "supplier_create"
  | "supplier_update"
  | "supplier_delete"
  | "order_status_change"
  | "user_role_change"
  | "user_delete"
  | "totp_enabled"
  | "totp_disabled"
  | "totp_devices_revoked"
  | "google_signup"
  | "google_linked";

interface AuditEntry {
  action: AuditAction;
  actor?: Pick<JWTPayload, "userId" | "email"> | null;
  entity?: string;
  entityId?: string | number;
  details?: Record<string, unknown>;
  ip?: string;
}

/**
 * Records who did what.
 *
 * Never throws: an audit write that fails must not take the actual operation
 * down with it. A missing line is bad, a failed sale because logging broke is
 * worse: the failure goes to the server log instead.
 *
 * The actor's email is stored alongside the id because the id is set to NULL
 * if that user is ever deleted, and a trail that disappears with the person
 * who left is not a trail.
 */
export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO audit_log (user_id, user_email, action, entity, entity_id, details, ip)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        entry.actor?.userId ?? null,
        entry.actor?.email ?? null,
        entry.action,
        entry.entity ?? null,
        entry.entityId != null ? String(entry.entityId) : null,
        entry.details ? JSON.stringify(entry.details) : null,
        entry.ip ?? null,
      ],
    );
  } catch (error) {
    console.error("Failed to write audit entry:", entry.action, error);
  }
}
