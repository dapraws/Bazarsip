/**
 * Asks Cloudinary for the size actually needed.
 *
 * Without this the browser downloads the stored image whatever its size,
 * even for a 48px thumbnail, and anything rendered through next/image is
 * fetched and re-encoded by our own server first. Cloudinary does the same
 * work at its CDN, which answers far faster than a small VPS can.
 *
 * f_auto picks WebP or AVIF per browser, q_auto picks a quality that holds
 * up at that size. Non-Cloudinary URLs (the Unsplash seeds) pass through
 * untouched.
 */
export function sizedImage(
  url: string | null | undefined,
  width: number,
): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }
  // Already transformed, leave it alone rather than stacking another set.
  if (/\/upload\/[^/]*[fqw]_/.test(url)) return url;

  return url.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
}
