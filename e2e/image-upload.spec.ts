import { test, expect } from "@playwright/test";
import { login, ADMIN } from "./helpers";

/**
 * Regression cover for batch photo upload.
 *
 * The widget callback used to read the image array captured when the picker
 * was opened. Picking ten photos fired ten success events, each rebuilding
 * the list from that same stale array, so nine were overwritten and only the
 * last survived. Selecting several photos from the phone gallery is the
 * whole point of the feature.
 *
 * Cloudinary is replaced with a stub so the test needs no account, no
 * network and no real files.
 */
const FAKE_CLOUDINARY = (count: number) => `
  window.cloudinary = {
    createUploadWidget: (config, callback) => ({
      open: () => {
        for (let i = 1; i <= ${count}; i++) {
          callback(null, {
            event: "success",
            info: { secure_url: "https://res.cloudinary.com/demo/foto-" + i + ".jpg" },
          });
        }
      },
      destroy: () => {},
    }),
  };
`;

test("memilih banyak foto sekaligus menyimpan semuanya", async ({ page }) => {
  await page.addInitScript(FAKE_CLOUDINARY(5));
  await login(page, ADMIN);
  await page.goto("/products/new");

  // The second uploader on the form is the gallery, which allows many files.
  const galleryButton = page
    .getByRole("button", { name: /Unggah foto/i })
    .last();
  await galleryButton.click();

  const previews = page.locator('img[alt^="Image "]');
  await expect(
    previews,
    "lima foto dipilih, lima harus tersimpan",
  ).toHaveCount(5);

  const sources = await previews.evaluateAll((nodes) =>
    nodes.map((n) => (n as HTMLImageElement).src),
  );
  for (let i = 1; i <= 5; i++) {
    expect(
      sources.some((s) => s.includes(`foto-${i}.jpg`)),
      `foto-${i} hilang`,
    ).toBe(true);
  }
});

test("membuka picker berulang kali tidak membangun ulang widget", async ({
  page,
}) => {
  await page.addInitScript(`
    window.__widgetsBuilt = 0;
    window.cloudinary = {
      createUploadWidget: (config, callback) => {
        window.__widgetsBuilt++;
        return {
          open: () => callback(null, {
            event: "success",
            info: { secure_url: "https://res.cloudinary.com/demo/x" + window.__widgetsBuilt + ".jpg" },
          }),
          destroy: () => {},
        };
      },
    };
  `);

  await login(page, ADMIN);
  await page.goto("/products/new");

  const button = page.getByRole("button", { name: /Unggah foto/i }).last();
  await button.click();
  await expect(page.locator('img[alt^="Image "]')).toHaveCount(1);

  // Opening again should reuse the widget. Rebuilding it recreates the
  // iframe, which is what made this slow on a phone.
  await page.getByRole("button", { name: "Tambah foto" }).click();

  const built = await page.evaluate(() => (window as any).__widgetsBuilt);
  expect(built, "widget dibangun ulang setiap kali dibuka").toBe(1);
});

test("script Cloudinary hanya dimuat sekali walau ada dua pengunggah", async ({
  page,
}) => {
  await login(page, ADMIN);
  await page.goto("/products/new");
  await page.waitForTimeout(1500);

  const tags = await page.evaluate(
    () =>
      document.querySelectorAll(
        'script[src*="upload-widget.cloudinary.com"]',
      ).length,
  );

  expect(tags, "bundle yang sama diunduh dua kali").toBeLessThanOrEqual(1);
});
