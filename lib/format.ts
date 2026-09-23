/**
 * Formats an amount as rupiah.
 *
 * Accepts strings because node-postgres returns DECIMAL columns as strings.
 * Calling toLocaleString() on one of those silently returns it unchanged, so
 * prices render as "2500000.00" instead of "Rp 2.500.000".
 */
export function formatRupiah(value: string | number | null | undefined) {
  const n = typeof value === "string" ? Number(value) : (value ?? 0);
  return `Rp ${Intl.NumberFormat("id-ID").format(Math.round(n || 0))}`;
}
