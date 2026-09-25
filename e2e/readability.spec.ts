import { test, expect } from "@playwright/test";
import { expectReadable, login, ADMIN } from "./helpers";

/**
 * Regression cover for text that vanished.
 *
 * globals.css flipped --foreground to near-white when the operating system
 * asked for dark mode, while every screen keeps its light Tailwind colours.
 * Anything without an explicit text colour became white on white. The sort
 * dropdown was separately unreadable in all modes: bg-yellow-950 with
 * text-white-950, which is not a Tailwind class at all, so the text stayed
 * near-black on dark brown.
 */
test.describe("teks terbaca di mode gelap", () => {
  test.use({ colorScheme: "dark" });

  test("label penyaring di halaman toko", async ({ page }) => {
    await page.goto("/shop");
    await page.waitForSelector("text=Kategori");

    await expectReadable(page, "body", "teks body");

    for (const label of ["Saring", "Kategori", "Untuk siapa", "Usia", "Gaya"]) {
      const selector = `xpath=//*[normalize-space(text())="${label}"]`;
      const el = page.locator(selector).first();
      await expect(el, `label "${label}" hilang`).toBeVisible();

      const colors = await el.evaluate((node) => {
        const color = getComputedStyle(node).color;
        let cur: Element | null = node;
        let background = "rgb(255, 255, 255)";
        while (cur) {
          const bg = getComputedStyle(cur).backgroundColor;
          if (bg && !bg.includes("rgba(0, 0, 0, 0)")) {
            background = bg;
            break;
          }
          cur = cur.parentElement;
        }
        return { color, background };
      });

      expect(
        colors.color,
        `label "${label}" mewarisi warna terang di atas kartu putih`,
      ).not.toBe("rgb(237, 237, 237)");
    }
  });

  test("dropdown urutkan terbaca", async ({ page }) => {
    await page.goto("/shop");
    const select = page.locator("select").first();
    await expect(select).toBeVisible();

    const classes = await select.getAttribute("class");
    expect(classes, "kelas Tailwind tidak valid").not.toContain("text-white-950");

    await expectReadable(page, "select", "dropdown urutkan");
  });

  test("form produk di admin", async ({ page }) => {
    await login(page, ADMIN);
    await page.goto("/products/new");
    await expect(page.getByText("Nama Produk")).toBeVisible();

    await expectReadable(page, "body", "teks body admin");
    await expectReadable(page, "#brand", "kolom merk");
  });
});

test("tidak ada kelas warna Tailwind yang tidak valid", async ({ page }) => {
  await page.goto("/shop");

  // A class Tailwind does not recognise is silently dropped, so the element
  // keeps whatever it inherited. These are invisible until someone looks.
  const bad = await page.evaluate(() => {
    const invalid = /\b(text|bg|border)-(white|black)-\d{2,3}\b/;
    return [...document.querySelectorAll("[class]")]
      .map((el) => el.className)
      .filter((c) => typeof c === "string" && invalid.test(c));
  });

  expect(bad, `kelas tidak valid ditemukan: ${bad.join(" | ")}`).toHaveLength(0);
});
