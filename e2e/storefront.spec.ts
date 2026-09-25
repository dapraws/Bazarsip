import { test, expect } from "@playwright/test";

test("etalase terbuka tanpa akun", async ({ page }) => {
  await page.goto("/shop");
  await expect(page).toHaveURL(/\/shop/);
  await expect(page.getByText("Semua")).toBeTruthy();
});

test("keranjang terbuka tanpa akun, checkout tidak", async ({ page }) => {
  await page.goto("/cart");
  await expect(page, "keranjang tidak butuh login").toHaveURL(/\/cart/);

  await page.goto("/checkout");
  await expect(page, "checkout harus meminta login").toHaveURL(/\/login/);
});

test("halaman admin menolak pengunjung", async ({ page }) => {
  for (const path of ["/dashboard", "/products", "/suppliers", "/audit"]) {
    await page.goto(path);
    await expect(page, `${path} harusnya terkunci`).toHaveURL(/\/login/);
  }
});

test("filter menyaring hasil", async ({ page, request }) => {
  const all = await (await request.get("/api/products?limit=100")).json();
  const total = all.pagination.total;
  test.skip(total === 0, "belum ada produk untuk disaring");

  const pria = await (await request.get("/api/products?gender=pria")).json();
  expect(pria.pagination.total).toBeLessThanOrEqual(total);

  for (const p of pria.data) {
    expect(p.gender, `${p.name} bukan untuk pria`).toBe("pria");
  }
});

test("data supplier tidak terlihat pengunjung", async ({ request }) => {
  const res = await request.get("/api/products?limit=5");
  const body = await res.json();

  for (const p of body.data ?? []) {
    expect(Object.keys(p).some((k) => k.includes("supplier"))).toBe(false);
  }
});
