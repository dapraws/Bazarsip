/**
 * Turns a display name into a URL-safe slug.
 *
 * Purely numeric results get a suffix so a slug can never be mistaken for a
 * row id by routes that accept either.
 */
export function slugify(input: string): string {
  const base = input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (base === "") return "item";
  if (/^\d+$/.test(base)) return `${base}-item`;
  return base;
}

/**
 * Returns `base`, or `base-2`, `base-3`... when it is already taken.
 *
 * Two products genuinely can share a name: the same plain tee from two
 * suppliers: so a collision should not be an error the seller has to solve.
 */
export function nextFreeSlug(base: string, taken: string[]): string {
  const used = new Set(taken);
  if (!used.has(base)) return base;

  let n = 2;
  while (used.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
