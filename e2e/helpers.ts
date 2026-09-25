import { Page, expect } from "@playwright/test";

export const ADMIN = { email: "admin@bazarsip.com", password: "admin123" };
export const CUSTOMER = {
  email: "customer@bazarsip.com",
  password: "customer123",
};

export async function login(
  page: Page,
  who: { email: string; password: string },
) {
  await page.goto("/login");
  await page.getByPlaceholder("nama@email.com").fill(who.email);
  await page.getByPlaceholder("Kata sandi").fill(who.password);
  await page.getByRole("button", { name: "Masuk" }).click();
  await page.waitForURL(/\/(dashboard|shop)/);
}

/** WCAG relative luminance. */
function luminance([r, g, b]: number[]): number {
  const [R, G, B] = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function parseRgb(value: string): number[] | null {
  const m = value.match(/(\d+(?:\.\d+)?)/g);
  return m && m.length >= 3 ? m.slice(0, 3).map(Number) : null;
}

export function contrastRatio(fg: string, bg: string): number | null {
  const f = parseRgb(fg);
  const b = parseRgb(bg);
  if (!f || !b) return null;
  const [l1, l2] = [luminance(f), luminance(b)].sort((a, z) => z - a);
  return (l1 + 0.05) / (l2 + 0.05);
}

/**
 * Reads the effective colours of an element, walking up for the first
 * ancestor with a non-transparent background.
 */
export async function colorsOf(page: Page, selector: string) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (!el) return null;
    const color = getComputedStyle(el).color;

    let node: Element | null = el;
    let background = "rgba(0, 0, 0, 0)";
    while (node) {
      const bg = getComputedStyle(node).backgroundColor;
      if (bg && !bg.includes("rgba(0, 0, 0, 0)")) {
        background = bg;
        break;
      }
      node = node.parentElement;
    }
    return { color, background };
  }, selector);
}

export async function expectReadable(page: Page, selector: string, label: string) {
  const colors = await colorsOf(page, selector);
  expect(colors, `${label}: element not found (${selector})`).not.toBeNull();

  const ratio = contrastRatio(colors!.color, colors!.background);
  expect(ratio, `${label}: could not parse colours`).not.toBeNull();

  // 4.5:1 is the WCAG AA threshold for normal text.
  expect(
    ratio!,
    `${label} is unreadable: ${colors!.color} on ${colors!.background} is ${ratio!.toFixed(2)}:1`,
  ).toBeGreaterThan(4.5);
}
