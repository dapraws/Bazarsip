/**
 * Normalises an Indonesian phone number to the digits-only form wa.me wants,
 * e.g. "0812-3456-789" and "+62 812 3456 789" both become "628123456789".
 *
 * Suppliers get written down however they were received — pasted from a chat,
 * copied off a business card, typed from memory — so the input is cleaned
 * rather than rejected. Returns null when there is not enough left to dial.
 */
export function normalizeWhatsapp(input: string | null): string | null {
  if (!input) return null;

  let digits = input.replace(/\D/g, "");
  if (digits === "") return null;

  if (digits.startsWith("0")) {
    digits = `62${digits.slice(1)}`;
  } else if (digits.startsWith("8")) {
    // Written without the leading zero, which is common when dictated.
    digits = `62${digits}`;
  }

  // Shortest plausible Indonesian mobile is 62 + 9 digits.
  return digits.length >= 11 ? digits : null;
}

/** Chat link for a stored number, or null when there is nothing to link to. */
export function whatsappLink(number: string | null): string | null {
  const normalized = normalizeWhatsapp(number);
  return normalized ? `https://wa.me/${normalized}` : null;
}
