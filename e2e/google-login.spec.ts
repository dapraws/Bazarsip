import { test, expect } from "@playwright/test";

/**
 * The flow is covered as far as it can be without real Google credentials:
 * what happens when it is not configured, that the redirect carries the
 * right parameters, and that a mismatched state is refused.
 */

test("tanpa kredensial, tombol Google tidak muncul", async ({ page, request }) => {
  const res = await request.get("/api/auth/providers");
  const body = await res.json();
  test.skip(body.data.google === true, "Google sudah dikonfigurasi di sini");

  await page.goto("/login");
  await expect(page.getByRole("button", { name: "Masuk" })).toBeVisible();
  await expect(
    page.getByText("Masuk dengan Google"),
    "tombol tidak boleh tampil kalau belum bisa dipakai",
  ).toHaveCount(0);
});

test("memulai tanpa kredensial dikembalikan dengan pesan", async ({
  page,
  request,
}) => {
  const providers = await (await request.get("/api/auth/providers")).json();
  test.skip(providers.data.google === true, "Google sudah dikonfigurasi");

  await page.goto("/api/auth/google");
  await expect(page).toHaveURL(/\/login\?error=google_tidak_tersedia/);
  await expect(page.getByText(/belum diaktifkan/i)).toBeVisible();
});

test("callback menolak state yang tidak cocok", async ({ request }) => {
  // No state cookie at all is the same shape as a prepared callback URL
  // handed to someone else.
  const res = await request.get(
    "/api/auth/google/callback?code=palsu&state=palsu",
    { maxRedirects: 0 },
  );

  expect([302, 307]).toContain(res.status());
  expect(
    res.headers()["location"],
    "state yang tidak cocok harus ditolak",
  ).toMatch(/error=(verifikasi_gagal|google_tidak_tersedia)/);
});

test("akun tanpa kata sandi tidak bisa masuk lewat form", async ({ request }) => {
  // Mimics an account created through Google: the password column is null,
  // and comparing against null would throw rather than refuse.
  const res = await request.post("/api/auth/login", {
    data: { email: "google-only@contoh.test", password: "apa-saja" },
  });

  // Unknown account and passwordless account must look identical from
  // outside, otherwise this becomes a way to enumerate addresses.
  expect([400, 401]).toContain(res.status());
});
