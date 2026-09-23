import { randomInt } from "crypto";

// No 0/O, 1/I/L or U: order codes get read aloud over WhatsApp and typed
// back in, so characters that are easy to confuse are left out.
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTVWXYZ";
const LENGTH = 8;

/**
 * A short public reference for an order, e.g. "BZR-K4M2X9PT".
 *
 * Random rather than sequential so the code does not disclose how many
 * orders the shop has taken. The unique index on orders.order_number is the
 * backstop for the rare collision.
 */
export function generateOrderNumber(): string {
  let code = "";
  for (let i = 0; i < LENGTH; i++) {
    code += ALPHABET[randomInt(ALPHABET.length)];
  }
  return `BZR-${code}`;
}
