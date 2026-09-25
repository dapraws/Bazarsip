import { test, expect } from "@playwright/test";
import { login, ADMIN } from "./helpers";

const NAME = `Uji Playwright ${Date.now()}`;

test("menambah produk lengkap dari layar ponsel", async ({ page }) => {
  await login(page, ADMIN);
  await page.goto("/products/new");

  await page.getByPlaceholder("Kaos polos lengan pendek").fill(NAME);
  await page.locator("#price").fill("125000");
  await page.locator("#stock").fill("7");
  await page.locator("#category").selectOption({ index: 1 });

  // One tap each, and tapping the active chip clears it.
  await page.getByRole("button", { name: "Wanita", exact: true }).click();
  await page.getByRole("button", { name: "Remaja", exact: true }).click();
  await page.getByRole("button", { name: "Formal", exact: true }).click();
  await page.locator("#brand").fill("Tanpa merk");

  await expect(
    page.getByRole("button", { name: "Wanita", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");

  await page.getByRole("button", { name: "Simpan Produk" }).click();
  await page.waitForURL("**/products");

  const res = await page.request.get(
    `/api/products?search=${encodeURIComponent(NAME)}`,
  );
  const body = await res.json();
  const created = body.data.find((p: { name: string }) => p.name === NAME);

  expect(created, "produk tidak tersimpan").toBeTruthy();
  expect(created.gender).toBe("wanita");
  expect(created.age_group).toBe("remaja");
  expect(created.style).toBe("formal");
  expect(created.brand).toBe("Tanpa merk");
  expect(Number(created.price)).toBe(125000);

  // The row is removed by the global teardown.
});

test("chip bisa dikosongkan lagi", async ({ page }) => {
  await login(page, ADMIN);
  await page.goto("/products/new");

  const chip = page.getByRole("button", { name: "Unisex", exact: true });
  await chip.click();
  await expect(chip).toHaveAttribute("aria-pressed", "true");

  await chip.click();
  await expect(
    chip,
    "mengetuk chip aktif harus mengosongkannya",
  ).toHaveAttribute("aria-pressed", "false");
});
