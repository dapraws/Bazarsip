// Recovery for an account locked out of two-factor.
//
// This is the manual path that stands in for a helpdesk: run it only after
// you have confirmed, by voice, that the person asking really is the account
// holder. It is deliberately not exposed over the web, because anything
// reachable from the internet is reachable by an attacker.
//
// Inspect:  node scripts/unlock-2fa.mjs bunda@example.com
// Unlock:   node scripts/unlock-2fa.mjs bunda@example.com --confirm
import pg from "pg";

const email = process.argv[2];
const confirmed = process.argv.includes("--confirm");

if (!email) {
  console.error("Pakai: node scripts/unlock-2fa.mjs <email> [--confirm]");
  process.exit(1);
}

const pool = new pg.Pool({
  connectionString:
    process.env.DATABASE_URL ??
    "postgres://postgres:postgres@localhost:5433/bazarsip",
});

try {
  const { rows } = await pool.query(
    `SELECT u.id, u.name, u.email, u.role, u.totp_enabled,
            COALESCE(array_length(u.recovery_codes, 1), 0) AS codes_left,
            (SELECT COUNT(*)::int FROM trusted_devices d
             WHERE d.user_id = u.id AND d.expires_at > CURRENT_TIMESTAMP) AS devices
     FROM users u WHERE u.email = $1`,
    [email],
  );

  const user = rows[0];
  if (!user) {
    console.error(`Tidak ada akun dengan email ${email}`);
    process.exit(1);
  }

  console.log(`\n  ${user.name} <${user.email}>`);
  console.log(`  peran               : ${user.role}`);
  console.log(`  verifikasi 2 langkah: ${user.totp_enabled ? "aktif" : "mati"}`);
  console.log(`  kode cadangan sisa  : ${user.codes_left}`);
  console.log(`  perangkat diingat   : ${user.devices}\n`);

  if (!user.totp_enabled) {
    console.log("Tidak terkunci: verifikasi dua langkah memang tidak aktif.");
    process.exit(0);
  }

  if (!confirmed) {
    console.log("Sebelum membuka, pastikan dulu lewat telepon bahwa ini");
    console.log("benar-benar orangnya. Email dan chat bisa dibajak, suara");
    console.log("yang kamu kenal tidak.\n");
    console.log("Kalau sudah yakin, jalankan lagi dengan --confirm");
    process.exit(0);
  }

  await pool.query(
    `UPDATE users
     SET totp_enabled = false, totp_secret = NULL,
         totp_last_step = NULL, recovery_codes = NULL
     WHERE id = $1`,
    [user.id],
  );

  await pool.query("DELETE FROM trusted_devices WHERE user_id = $1", [user.id]);

  // The unlock is recorded like any other change. A recovery path nobody can
  // see afterwards is a backdoor, not a recovery path.
  await pool.query(
    `INSERT INTO audit_log (user_id, user_email, action, entity, entity_id, details, ip)
     VALUES ($1, $2, 'totp_disabled', 'user', $2, $3, 'cli')`,
    [
      user.id,
      user.email,
      JSON.stringify({ via: "unlock-2fa script", devices_revoked: user.devices }),
    ],
  );

  console.log("Dibuka. Akun sekarang bisa masuk dengan kata sandi saja.");
  console.log("Minta dia segera mengaktifkan ulang lewat menu Keamanan,");
  console.log("dan simpan kode cadangan yang baru di kertas.");
} finally {
  await pool.end();
}
